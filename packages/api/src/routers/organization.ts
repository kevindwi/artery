import z from "zod";
import { protectedProcedure, router } from "../index";
import { organizationService } from "../services/organization";

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
    .input(
      z.object({
        name: z.string().min(5, "Organization name is required"),
        slug: z.string().min(5, "Slug is required"),
        description: z.string().optional(),
        logo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await organizationService.create(userId, input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(12),
        name: z.string().min(5, "Organization name is required"),
        slug: z.string().min(5, "Slug is required"),
        description: z.string().optional(),
        logo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      const { id, ...updateData } = input;
      return await organizationService.update(userId, id, updateData);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await organizationService.delete(userId, input.id);
    }),
});
