import z from "zod";
import { protectedProcedure, router } from "../index";
import { templateService } from "../services/template";

export const templateRouter = router({
  all: protectedProcedure
    .input(z.object({ organizationId: z.string().min(12, "Id is required") }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await templateService.getAll(userId, input.organizationId);
    }),
  byId: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(12),
        templateId: z.string().min(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await templateService.getById(
        userId,
        input.organizationId,
        input.templateId,
      );
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(5, "Template name is required"),
        organizationId: z.string().min(12, "Id is required"),
        hardwarePlatform: z.string("Hardware platform is required"),
        connectionType: z.string("Connection type is required"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await templateService.create(userId, input);
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(12, "Id is required"),
        name: z.string().min(5, "Template name is required"),
        organizationId: z.string().min(12, "Organization id is required"),
        hardwarePlatform: z.string("Hardware platform is required"),
        connectionType: z.string("Connection type is required"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      const { id, ...updateData } = input;
      return await templateService.update(userId, id, updateData);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await templateService.delete(userId, input.id);
    }),
});
