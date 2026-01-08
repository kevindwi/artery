import z from "zod";
import { organizationProcedure, router } from "../index";
import {
  createTemplateSchema,
  templateService,
  updateTemplateSchema,
} from "../services/template";
import { TRPCError } from "@trpc/server";

export const templateRouter = router({
  all: organizationProcedure
    .query(async ({ ctx }) => {
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
  create: organizationProcedure
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      if (!["OWNER", "ADMIN"].includes(ctx.memberRole)) {
        throw new TRPCError({
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        });
      }

      return await templateService.create(userId, input);
    }),
  update: organizationProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      if (!["OWNER", "ADMIN"].includes(ctx.memberRole)) {
        throw new TRPCError({
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        });
      }

      const { id, ...updateData } = input;
      return await templateService.update(ctx.activeOrgId, id, ctx.session.session.userId, updateData);
    }),
  delete: organizationProcedure
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      if (!["OWNER", "ADMIN"].includes(ctx.memberRole)) {
        throw new TRPCError({
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        });
      }

      return await templateService.delete(ctx.activeOrgId, input.id);
    }),
});
