import { z } from "zod";
import { organizationProcedure, router } from "../index";
import {
  createDatastreamSchema,
  datastreamService,
  updateDatastreamSchema,
} from "../services/datastream";
import { TRPCError } from "@trpc/server";

export const datastreamRouter = router({
  all: organizationProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ input }) => {
      return await datastreamService.getAll(input.templateId);
    }),
  byId: organizationProcedure
    .input(z.object({ id: z.string(), templateId: z.string() }))
    .query(async ({ input }) => {
      const { id, templateId } = input;
      return await datastreamService.getById(id, templateId);
    }),
  create: organizationProcedure
    .input(createDatastreamSchema)
    .mutation(async ({ ctx, input }) => {
      if (!["OWNER", "ADMIN"].includes(ctx.memberRole)) {
        throw new TRPCError({
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        });
      }

      return await datastreamService.create(ctx.activeOrgId, input);
    }),
  update: organizationProcedure
    .input(updateDatastreamSchema)
    .mutation(async ({ ctx, input }) => {
      if (!["OWNER", "ADMIN"].includes(ctx.memberRole)) {
        throw new TRPCError({
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        });
      }

      return await datastreamService.update(ctx.activeOrgId, input);
    }),
  delete: organizationProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!["OWNER", "ADMIN"].includes(ctx.memberRole)) {
        throw new TRPCError({
          message: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        });
      }

      return await datastreamService.delete(input.id, ctx.activeOrgId);
    }),
});
