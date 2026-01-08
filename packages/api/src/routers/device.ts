import z from "zod";
import { organizationProcedure, router } from "../index";
import { deviceService } from "../services/device";

export const deviceRouter = router({
  all: organizationProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx }) => {
      return await deviceService.getAll(ctx.activeOrgId);
    }),
  byId: organizationProcedure
    .input(z.object({ deviceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await deviceService.getById(ctx.activeOrgId, input.deviceId);
    }),
});
