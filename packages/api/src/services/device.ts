import { and, db, eq } from "@artery/db";
import { assertMemberRole } from "./organization";
import { device } from "@artery/db/schema/device";
import { TRPCError } from "@trpc/server";

export const deviceService = {
  getAll: async (userId: string, organizationId: string) => {
    await assertMemberRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

    return await db.query.device.findMany({
      where: eq(device.organizationId, organizationId),
    });
  },
  getById: async (userId: string, organizationId: string, deviceId: string) => {
    await assertMemberRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

    const deviceDetail = await db.query.device.findFirst({
      where: and(eq(device.id, deviceId), eq(device.organizationId, organizationId)),
    });

    if (!deviceDetail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Device not found in this organization",
      });
    }

    return deviceDetail;
  },
};
