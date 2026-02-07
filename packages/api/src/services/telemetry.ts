import { and, db, desc, eq, gte, lte, sql } from "@artery/db";
import { telemetry } from "@artery/db/schema/telemetry";
import { device } from "@artery/db/schema/device";
import { datastream } from "@artery/db/schema/datastream";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const timeRanges = ["1h", "6h", "24h", "7d", "30d", "custom"] as const;
export type TimeRange = (typeof timeRanges)[number];

export const telemetryQuerySchema = z.object({
    deviceId: z.string(),
    datastreamId: z.string().optional(),
    timeRange: z.enum(timeRanges).default("24h"),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    limit: z.number().min(1).max(1000).default(500),
});

export type TelemetryQueryOptions = z.infer<typeof telemetryQuerySchema>;

// Helper to calculate time range
function getTimeRangeDate(range: TimeRange): Date {
    const now = new Date();
    switch (range) {
        case "1h":
            return new Date(now.getTime() - 60 * 60 * 1000);
        case "6h":
            return new Date(now.getTime() - 6 * 60 * 60 * 1000);
        case "24h":
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case "7d":
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d":
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() - 24 * 60 * 60 * 1000); // default to 24h
    }
}

// Helper to determine aggregation interval based on time range
function getAggregationInterval(range: TimeRange): string | null {
    switch (range) {
        case "1h":
            return null; // No aggregation, use raw data
        case "6h":
            return "1 minute";
        case "24h":
            return "5 minutes";
        case "7d":
            return "30 minutes";
        case "30d":
            return "2 hours";
        default:
            return null;
    }
}

// Format value based on which column is populated
function formatTelemetryValue(record: any) {
    if (record.valueBoolean !== null) return record.valueBoolean;
    if (record.valueDouble !== null) return record.valueDouble;
    if (record.valueLong !== null) return Number(record.valueLong);
    if (record.valueString !== null) return record.valueString;
    return null;
}

export const telemetryService = {
    // Get telemetry data by device with optional filters
    getByDevice: async (
        organizationId: string,
        options: TelemetryQueryOptions,
    ) => {
        const { deviceId, datastreamId, timeRange, startTime, endTime, limit } =
            options;

        // Verify device belongs to organization
        const deviceRecord = await db.query.device.findFirst({
            where: eq(device.id, deviceId),
            columns: {
                id: true,
                organizationId: true,
            },
        });

        if (!deviceRecord) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Device not found",
            });
        }

        if (deviceRecord.organizationId !== organizationId) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Access denied to this device",
            });
        }

        // Determine time range
        const start = startTime || getTimeRangeDate(timeRange);
        const end = endTime || new Date();

        // Build where conditions
        const conditions = [
            eq(telemetry.deviceId, deviceId),
            gte(telemetry.timestamp, start),
            lte(telemetry.timestamp, end),
        ];

        if (datastreamId) {
            conditions.push(eq(telemetry.datastreamId, datastreamId));
        }

        // Check if we need aggregation
        const aggregationInterval = getAggregationInterval(timeRange);

        if (!aggregationInterval || timeRange === "custom") {
            // No aggregation - return raw data
            const records = await db.query.telemetry.findMany({
                where: and(...conditions),
                orderBy: [desc(telemetry.timestamp)],
                limit,
                with: {
                    datastream: {
                        columns: {
                            id: true,
                            name: true,
                            pin: true,
                            dataType: true,
                        },
                    },
                },
            });

            return records.map((record) => ({
                id: record.id,
                deviceId: record.deviceId,
                datastreamId: record.datastreamId,
                datastreamName: record.datastream.name,
                pin: record.datastream.pin,
                dataType: record.datastream.dataType,
                value: formatTelemetryValue(record),
                timestamp: record.timestamp,
            }));
        } else {
            // Use aggregation for better performance
            // This uses PostgreSQL's time_bucket-like functionality
            const aggregatedData = await db
                .select({
                    datastreamId: telemetry.datastreamId,
                    datastreamName: datastream.name,
                    pin: datastream.pin,
                    dataType: datastream.dataType,
                    timestamp: sql<Date>`date_trunc('minute', ${telemetry.timestamp}) + 
            (floor(extract(epoch from ${telemetry.timestamp}) / 
            extract(epoch from interval '${sql.raw(aggregationInterval)}')) * 
            extract(epoch from interval '${sql.raw(aggregationInterval)}')) * interval '1 second'`,
                    avgDouble: sql<number | null>`avg(${telemetry.valueDouble})`,
                    avgLong: sql<number | null>`round(avg(${telemetry.valueLong}))`,
                    // For boolean, take the most recent value in the interval
                    lastBoolean: sql<boolean | null>`(array_agg(${telemetry.valueBoolean} ORDER BY ${telemetry.timestamp} DESC))[1]`,
                    // For string, take the most recent value in the interval
                    lastString: sql<string | null>`(array_agg(${telemetry.valueString} ORDER BY ${telemetry.timestamp} DESC))[1]`,
                })
                .from(telemetry)
                .innerJoin(datastream, eq(telemetry.datastreamId, datastream.id))
                .where(and(...conditions))
                .groupBy(
                    telemetry.datastreamId,
                    datastream.name,
                    datastream.pin,
                    datastream.dataType,
                    sql`date_trunc('minute', ${telemetry.timestamp}) + 
            (floor(extract(epoch from ${telemetry.timestamp}) / 
            extract(epoch from interval '${sql.raw(aggregationInterval)}')) * 
            extract(epoch from interval '${sql.raw(aggregationInterval)}')) * interval '1 second'`,
                )
                .orderBy(
                    sql`date_trunc('minute', ${telemetry.timestamp}) + 
            (floor(extract(epoch from ${telemetry.timestamp}) / 
            extract(epoch from interval '${sql.raw(aggregationInterval)}')) * 
            extract(epoch from interval '${sql.raw(aggregationInterval)}')) * interval '1 second' DESC`,
                )
                .limit(limit);

            return aggregatedData.map((record) => {
                let value: any = null;
                if (record.dataType === "BOOL") value = record.lastBoolean;
                else if (record.dataType === "STRING") value = record.lastString;
                else if (record.dataType === "DOUBLE") value = record.avgDouble;
                else if (record.dataType === "INT") value = record.avgLong;

                return {
                    datastreamId: record.datastreamId,
                    datastreamName: record.datastreamName,
                    pin: record.pin,
                    dataType: record.dataType,
                    value,
                    timestamp: record.timestamp,
                };
            });
        }
    },

    // Get telemetry data by datastream
    getByDatastream: async (
        organizationId: string,
        datastreamId: string,
        options: Omit<TelemetryQueryOptions, "deviceId" | "datastreamId">,
    ) => {
        // Verify datastream belongs to organization
        const datastreamRecord = await db.query.datastream.findFirst({
            where: eq(datastream.id, datastreamId),
            with: {
                template: {
                    columns: {
                        organizationId: true,
                    },
                },
            },
        });

        if (!datastreamRecord) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Datastream not found",
            });
        }

        if (datastreamRecord.template.organizationId !== organizationId) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Access denied to this datastream",
            });
        }

        const { timeRange, startTime, endTime, limit } = options;

        // Determine time range
        const start = startTime || getTimeRangeDate(timeRange);
        const end = endTime || new Date();

        const records = await db.query.telemetry.findMany({
            where: and(
                eq(telemetry.datastreamId, datastreamId),
                gte(telemetry.timestamp, start),
                lte(telemetry.timestamp, end),
            ),
            orderBy: [desc(telemetry.timestamp)],
            limit,
            with: {
                datastream: {
                    columns: {
                        id: true,
                        name: true,
                        pin: true,
                        dataType: true,
                    },
                },
            },
        });

        return records.map((record) => ({
            id: record.id,
            deviceId: record.deviceId,
            datastreamId: record.datastreamId,
            datastreamName: record.datastream.name,
            pin: record.datastream.pin,
            dataType: record.datastream.dataType,
            value: formatTelemetryValue(record),
            timestamp: record.timestamp,
        }));
    },

    // Get latest telemetry values for a device
    getLatest: async (organizationId: string, deviceId: string) => {
        // Verify device belongs to organization
        const deviceRecord = await db.query.device.findFirst({
            where: eq(device.id, deviceId),
            columns: {
                id: true,
                organizationId: true,
                templateId: true,
            },
        });

        if (!deviceRecord) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Device not found",
            });
        }

        if (deviceRecord.organizationId !== organizationId) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Access denied to this device",
            });
        }

        // Get all datastreams for this device's template
        const datastreams = await db.query.datastream.findMany({
            where: eq(datastream.templateId, deviceRecord.templateId),
        });

        // Get latest telemetry for each datastream
        const latestValues = await Promise.all(
            datastreams.map(async (ds) => {
                const latest = await db.query.telemetry.findFirst({
                    where: and(
                        eq(telemetry.deviceId, deviceId),
                        eq(telemetry.datastreamId, ds.id),
                    ),
                    orderBy: [desc(telemetry.timestamp)],
                    with: {
                        datastream: {
                            columns: {
                                id: true,
                                name: true,
                                pin: true,
                                dataType: true,
                            },
                        },
                    },
                });

                if (!latest) return null;

                return {
                    id: latest.id,
                    deviceId: latest.deviceId,
                    datastreamId: latest.datastreamId,
                    datastreamName: latest.datastream.name,
                    pin: latest.datastream.pin,
                    dataType: latest.datastream.dataType,
                    value: formatTelemetryValue(latest),
                    timestamp: latest.timestamp,
                };
            }),
        );

        return latestValues.filter((v) => v !== null);
    },
};
