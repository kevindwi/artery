import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { datastreamService } from "../services/datastream";
import { dataTypes } from "@artery/db/schema/datastream";

const createDatastreamSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  pin: z.string(),
  dataType: z.enum(dataTypes),
  min: z.number().optional(),
  max: z.number().optional(),
  defaultValue: z.string().optional(),
});

const updateDatastreamSchema = createDatastreamSchema
  .omit({
    templateId: true,
  })
  .extend({
    id: z.string(),
  });

export const datastreamRouter = router({
  all: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;
      return await datastreamService.getAll(userId, input.templateId);
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;
      return await datastreamService.getById(userId, input.id);
    }),
  create: protectedProcedure
    .input(createDatastreamSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;
      return await datastreamService.create(userId, input);
    }),
  update: protectedProcedure
    .input(updateDatastreamSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;
      const { id, ...data } = input;
      return await datastreamService.update(userId, id, data);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;
      return await datastreamService.delete(userId, input.id);
    }),
});
