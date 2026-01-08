import { protectedProcedure, publicProcedure, router } from "../index";
import { templateRouter } from "./template";
import { datastreamRouter } from "./datastream";
import { deviceRouter } from "./device";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  template: templateRouter,
  datastream: datastreamRouter,
  device: deviceRouter,
});
export type AppRouter = typeof appRouter;
