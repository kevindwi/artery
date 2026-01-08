import z from "zod";
import {
  canCreateTemplate,
  canDeleteTemplate,
  canUpdateTemplate,
  organizationProcedure,
  router,
} from "../index";
import {
  createTemplateSchema,
  templateService,
  updateTemplateSchema,
} from "../services/template";

export const templateRouter = router({
  all: organizationProcedure.query(async ({ ctx }) => {
    return await templateService.getAll(ctx.activeOrgId);
  }),
  byId: organizationProcedure
    .input(
      z.object({
        templateId: z.string().min(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { templateId } = input;

      return await templateService.getById(ctx.activeOrgId, templateId);
    }),
  create: canCreateTemplate
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await templateService.create(userId, {
        ...input,
        organizationId: ctx.activeOrgId,
      });
    }),
  update: canUpdateTemplate
    .input(updateTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      return await templateService.update(
        ctx.activeOrgId,
        id,
        ctx.session.session.userId,
        updateData,
      );
    }),
  delete: canDeleteTemplate
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      return await templateService.delete(ctx.activeOrgId, input.id);
    }),
});
