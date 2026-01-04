import z from "zod";
import { protectedProcedure, router } from "../index";
import {
  createTemplateSchema,
  templateService,
  updateTemplateSchema,
} from "../services/template";

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
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await templateService.create(userId, input);
    }),
  update: protectedProcedure
    .input(updateTemplateSchema)
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
