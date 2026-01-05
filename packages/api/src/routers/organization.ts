import z from "zod";
import { protectedProcedure, router } from "../index";
import {
  createOrganizationSchema,
  organizationService,
  updateOrganizationSchema,
} from "../services/organization";

export const organizationRouter = router({
  // Retrieves all workspaces for the authenticated user
  all: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
    const { userId } = ctx.session.session;

    return await organizationService.getAll(userId);
  }),
  byId: protectedProcedure
    .input(z.object({ organizationId: z.string().min(12) }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await organizationService.getById(userId, input.organizationId);
    }),
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await organizationService.create(userId, input);
    }),
  update: protectedProcedure
    .input(updateOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      const { id, ...data } = input;
      return await organizationService.update(userId, id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await organizationService.delete(userId, input.id);
    }),
});
