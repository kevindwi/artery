import { and, db, eq } from "@artery/db";
import { datastream, dataTypes } from "@artery/db/schema/datastream";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { template } from "@artery/db/schema/template";

export const createDatastreamSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  pin: z.string(),
  dataType: z.enum(dataTypes),
  min: z.number().optional(),
  max: z.number().optional(),
  defaultValue: z.string().optional(),
});

export const updateDatastreamSchema = createDatastreamSchema.extend({
  id: z.string(),
});

async function getTemplate(templateId: string) {
  const tmpl = await db.query.template.findFirst({
    where: eq(template.id, templateId),
    columns: {
      organizationId: true,
    },
  });

  if (!tmpl) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Template not found",
    });
  }

  return tmpl;
}

export const datastreamService = {
  getAll: async (templateId: string) => {
    await getTemplate(templateId);

    return await db.query.datastream.findMany({
      where: eq(datastream.templateId, templateId),
    });
  },
  getById: async (id: string, templateId: string) => {
    const ds = await db.query.datastream.findFirst({
      where: and(eq(datastream.id, id), eq(datastream.templateId, templateId)),
      with: {
        template: {
          columns: {
            organizationId: true,
          },
        },
      },
    });

    if (!ds) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Datastream not found",
      });
    }

    return ds;
  },
  create: async (
    activeOrgId: string,
    data: z.infer<typeof createDatastreamSchema>,
  ) => {
    const tmpl = await db.query.template.findFirst({
      where: and(
        eq(template.id, data.templateId),
        eq(template.organizationId, activeOrgId),
      ),
    });

    if (!tmpl) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Template not found or access denied",
      });
    }

    // Cek uniqueness pin
    const existingPin = await db.query.datastream.findFirst({
      where: and(
        eq(datastream.templateId, data.templateId),
        eq(datastream.pin, data.pin),
      ),
    });

    if (existingPin) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Pin ${data.pin} already exists in this template`,
      });
    }

    const [newItem] = await db.insert(datastream).values(data).returning();
    return newItem;
  },
  update: async (
    activeOrgId: string,
    data: z.infer<typeof updateDatastreamSchema>,
  ) => {
    const ds = await db.query.datastream.findFirst({
      where: eq(datastream.id, data.id),
      with: {
        template: {
          columns: {
            organizationId: true,
          },
        },
      },
    });

    if (!ds) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Datastream not found",
      });
    }

    if (ds.template.organizationId !== activeOrgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const [updatedItem] = await db
      .update(datastream)
      .set(data)
      .where(eq(datastream.id, data.id))
      .returning();
    return updatedItem;
  },
  delete: async (activeOrgId: string, datastreamId: string) => {
    const ds = await db.query.datastream.findFirst({
      where: eq(datastream.id, datastreamId),
      with: {
        template: {
          columns: {
            organizationId: true,
          },
        },
      },
    });

    if (!ds) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Datastream not found",
      });
    }

    if (ds.template.organizationId !== activeOrgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const [deletedItem] = await db
      .delete(datastream)
      .where(eq(datastream.id, datastreamId))
      .returning();
    return deletedItem;
  },
};
