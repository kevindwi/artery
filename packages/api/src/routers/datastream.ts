import { z } from "zod";
import {
  canCreateDatastream,
  canDeleteDatastream,
  canUpdateDatastream,
  organizationProcedure,
  router,
} from "../index";
import {
  createDatastreamSchema,
  datastreamService,
  updateDatastreamSchema,
} from "../services/datastream";

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
  create: canCreateDatastream
    .input(createDatastreamSchema)
    .mutation(async ({ ctx, input }) => {
      return await datastreamService.create(ctx.activeOrgId, input);
    }),
  update: canUpdateDatastream
    .input(updateDatastreamSchema)
    .mutation(async ({ ctx, input }) => {
      return await datastreamService.update(ctx.activeOrgId, input);
    }),
  delete: canDeleteDatastream
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await datastreamService.delete(ctx.activeOrgId, input.id);
    }),
});
