import { z } from "zod";
import {
  canCreateDevice,
  canDeleteDevice,
  canUpdateDevice,
  deviceProcedure,
  organizationProcedure,
  router,
} from "../index";
import {
  createDeviceSchema,
  deviceService,
  updateDeviceSchema,
} from "../services/device";
import { deviceStatus } from "@artery/db/schema/device";

export const deviceRouter = router({
  all: organizationProcedure.query(async ({ ctx }) => {
    return await deviceService.getAll(ctx.activeOrgId);
  }),
  byId: organizationProcedure
    .input(
      z.object({
        deviceId: z.string().min(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { deviceId } = input;
      return await deviceService.getById(ctx.activeOrgId, deviceId);
    }),
  create: canCreateDevice
    .input(createDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await deviceService.create(userId, {
        ...input,
        organizationId: ctx.activeOrgId,
      });
    }),
  update: canUpdateDevice
    .input(updateDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      return await deviceService.update(ctx.activeOrgId, input);
    }),
  delete: canDeleteDevice
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      return await deviceService.delete(ctx.activeOrgId, input.id);
    }),
  regenerateToken: canUpdateDevice
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      return await deviceService.regenerateToken(ctx.activeOrgId, input.id);
    }),

  updateStatus: deviceProcedure
    .input(z.object({ status: z.enum(deviceStatus) }))
    .mutation(async ({ ctx, input }) => {
      return await deviceService.updateStatus(ctx.device.id, input.status);
    }),
});
