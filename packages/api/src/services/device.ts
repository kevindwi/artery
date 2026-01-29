import { and, db, eq } from "@artery/db";
import { device } from "@artery/db/schema/device";
import { init } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const createDeviceSchema = z.object({
  name: z.string().min(1),
  templateId: z.string(),
});

export const updateDeviceSchema = createDeviceSchema
  .omit({ templateId: true })
  .extend({
    id: z.string(),
  });

const createId = init({
  random: Math.random,
  length: 32,
  fingerprint: "e328d6c815d11bbe1bff637a20196505",
});

export const deviceService = {
  getAll: async (organizationId: string) => {
    return await db.query.device.findMany({
      where: eq(device.organizationId, organizationId),
      with: {
        template: {
          columns: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  },
  getById: async (organizationId: string, deviceId: string) => {
    const deviceDetail = await db.query.device.findFirst({
      where: and(eq(device.id, deviceId), eq(device.organizationId, organizationId)),
      with: {
        template: {
          columns: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!deviceDetail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Device not found in this organization",
      });
    }

    return deviceDetail;
  },
  // Validate device exists and token is not revoked
  validateDevice: async (deviceId: string) => {
    const deviceRecord = await db.query.device.findFirst({
      where: eq(device.id, deviceId),
      with: {
        template: true,
      },
    });

    if (!deviceRecord) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Device not found: ${deviceId}`,
      });
    }

    if (deviceRecord.tokenRevoked) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Device token revoked: ${deviceId}`,
      });
    }

    return deviceRecord;
  },

  create: async (
    userId: string,
    data: z.infer<typeof createDeviceSchema> & {
      organizationId: string;
    },
  ) => {
    const authToken = createId();

    const [newDevice] = await db
      .insert(device)
      .values({ ...data, createdBy: userId, authToken })
      .returning();
    return newDevice;
  },
  update: async (activeOrgId: string, data: z.infer<typeof updateDeviceSchema>) => {
    const deviceRecord = await db.query.device.findFirst({
      where: eq(device.id, data.id),
    });

    if (!deviceRecord) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Device not found",
      });
    }

    const [updatedDevice] = await db
      .update(device)
      .set({ ...data })
      .where(and(eq(device.organizationId, activeOrgId), eq(device.id, data.id)))
      .returning();
    return updatedDevice;
  },
  delete: async (activeOrgId: string, deviceId: string) => {
    const ds = await db.query.device.findFirst({
      where: eq(device.id, deviceId),
    });

    if (!ds) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Device not found",
      });
    }

    const [deletedItem] = await db
      .delete(device)
      .where(and(eq(device.organizationId, activeOrgId), eq(device.id, deviceId)))
      .returning();
    return deletedItem;
  },
  regenerateToken: async (activeOrgId: string, deviceId: string) => {
    const ds = await db.query.device.findFirst({
      where: eq(device.id, deviceId),
    });

    if (!ds) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Device not found",
      });
    }

    const authToken = createId();

    const [updatedDevice] = await db
      .update(device)
      .set({ authToken })
      .where(and(eq(device.organizationId, activeOrgId), eq(device.id, deviceId)))
      .returning();
    return updatedDevice;
  },
  updateStatus: async (deviceId: string, status: "ONLINE" | "OFFLINE") => {
    const [updatedDevice] = await db
      .update(device)
      .set({ status })
      .where(eq(device.id, deviceId))
      .returning();
    return updatedDevice;
  },
};
