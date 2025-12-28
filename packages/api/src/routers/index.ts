import { protectedProcedure, publicProcedure, router } from "../index";
import { organizationRouter } from "./organization";
import { templateRouter } from "./template";
import { todoRouter } from "./todo";

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
  todo: todoRouter,
  organization: organizationRouter,
  template: templateRouter,
});
export type AppRouter = typeof appRouter;
