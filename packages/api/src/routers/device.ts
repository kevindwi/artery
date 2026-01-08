import z from "zod";
import { protectedProcedure, router } from "../index";
import { deviceService } from "../services/device";

export const deviceRouter = router({
  all: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;
      return await deviceService.getAll(userId, input.organizationId);
    }),
  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async () => {}),
});
