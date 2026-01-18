import { db, eq } from "@artery/db";
import { device } from "@artery/db/schema/device";
import { telemetry } from "@artery/db/schema/telemetry";
import { deviceState } from "@artery/db/schema/deviceState";
import { datastreamService } from "./datastream";
import { deviceService } from "./device";
import z from "zod";

export const telemetryPayloadSchema = z.object({
  pin: z.string(),
  value: z.union([z.number(), z.boolean(), z.string()]),
  timestamp: z.number().optional(),
});

export type TelemetryPayload = z.infer<typeof telemetryPayloadSchema>;

export type IngestionResult = {
  success: boolean;
  deviceId: string;
  pin: string;
  timestamp: Date;
  duration: number;
};

export const ingestionService = {
  ingest: async (deviceId: string, payload: TelemetryPayload) => {
    const startTime = Date.now();

    const deviceRecord = await deviceService.validateDevice(deviceId);

    // Validate datastream exists for this template and pin
    const datastreamRecord = await datastreamService.validateDatastream(
      deviceRecord.templateId,
      payload.pin,
    );

    const formattedValue = ingestionService.formatValue(
      payload.value,
      datastreamRecord.dataType,
    );

    const recordTimestamp = payload.timestamp
      ? new Date(payload.timestamp * 1000)
      : new Date();

    const reportedAt = new Date();

    await db.transaction(async (tx) => {
      // Insert telemetry
      await tx.insert(telemetry).values({
        deviceId: deviceRecord.id,
        datastreamId: datastreamRecord.id,
        ...formattedValue,
        timestamp: recordTimestamp,
        reportedAt,
      });

      // Upsert device state (current value)
      await tx
        .insert(deviceState)
        .values({
          deviceId: deviceRecord.id,
          datastreamId: datastreamRecord.id,
          ...formattedValue,
          reportedAt,
        })
      // .onConflictDoUpdate({
      //   target: [deviceState.deviceId, deviceState.datastreamId],
      //   set: {
      //     ...formattedValue,
      //     reportedAt,
      //   },
      // });

      // Update device lastSeen and status
      await tx
        .update(device)
        .set({
          lastSeen: reportedAt,
          status: "ONLINE",
        })
        .where(eq(device.id, deviceRecord.id));
    });

    const duration = Date.now() - startTime;

    console.log(
      `Ingestion success: device=${deviceId}, pin=${payload.pin}, value=${payload.value}, duration=${duration}ms`,
    );

    return {
      success: true,
      deviceId,
      pin: payload.pin,
      timestamp: recordTimestamp,
      duration,
    };
  },

  // Batch ingestion - process multiple telemetry records at once
  ingestBatch: async (deviceId: string, payloads: TelemetryPayload[]) => {
    const results: IngestionResult[] = [];

    for (const payload of payloads) {
      try {
        const result = await ingestionService.ingest(deviceId, payload);
        results.push(result);
      } catch (error) {
        console.error(`Batch ingestion error for pin ${payload.pin}:`, error);
      }
    }

    return results;
  },

  // Format value based on datastream type
  formatValue: (value: unknown, dataType: string) => {
    switch (dataType) {
      case "INT":
        return { valueLong: BigInt(Math.floor(Number(value))) };
      case "DOUBLE":
        return { valueDouble: Number(value) };
      case "BOOL":
        return { valueBoolean: Boolean(value) };
      case "STRING":
        return { valueString: String(value) };
      default:
        console.warn(`Unknown data type: ${dataType}, defaulting to STRING`);
        return { valueString: String(value) };
    }
  },
};
