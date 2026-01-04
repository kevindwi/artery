import { and, db, eq } from "@artery/db";
import { datastream, dataTypes } from "@artery/db/schema/datastream";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { assertMemberRole } from "./organization";
import { template } from "@artery/db/schema/template";

const createDatastreamSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  pin: z.string(),
  dataType: z.enum(dataTypes),
  min: z.number().optional(),
  max: z.number().optional(),
  defaultValue: z.string().optional(),
});

const updateDatastreamSchema = createDatastreamSchema.omit({
  templateId: true,
});

async function getTemplateAndAssertMember(
  templateId: string,
  userId: string,
  roles: ("OWNER" | "ADMIN" | "MEMBER")[] = ["OWNER", "ADMIN", "MEMBER"],
) {
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
  await assertMemberRole(userId, tmpl.organizationId, roles);
  return tmpl;
}

export const datastreamService = {
  getAll: async (userId: string, templateId: string) => {
    await getTemplateAndAssertMember(templateId, userId);
    return await db.query.datastream.findMany({
      where: eq(datastream.templateId, templateId),
    });
  },
  getById: async (userId: string, id: string) => {
    const ds = await db.query.datastream.findFirst({
      where: eq(datastream.id, id),
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
    await assertMemberRole(userId, ds.template.organizationId, [
      "OWNER",
      "ADMIN",
      "MEMBER",
    ]);
    return ds;
  },
  create: async (userId: string, data: z.infer<typeof createDatastreamSchema>) => {
    await getTemplateAndAssertMember(data.templateId, userId, ["OWNER", "ADMIN"]);
    const [newItem] = await db.insert(datastream).values(data).returning();
    return newItem;
  },
  update: async (
    userId: string,
    id: string,
    data: z.infer<typeof updateDatastreamSchema>,
  ) => {
    const ds = await db.query.datastream.findFirst({
      where: eq(datastream.id, id),
      columns: {
        templateId: true,
      },
    });
    if (!ds) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Datastream not found",
      });
    }
    await getTemplateAndAssertMember(ds.templateId, userId, ["OWNER", "ADMIN"]);
    const [updatedItem] = await db
      .update(datastream)
      .set(data)
      .where(eq(datastream.id, id))
      .returning();
    return updatedItem;
  },
  delete: async (userId: string, id: string) => {
    const ds = await db.query.datastream.findFirst({
      where: eq(datastream.id, id),
      columns: {
        templateId: true,
      },
    });
    if (!ds) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Datastream not found",
      });
    }
    await getTemplateAndAssertMember(ds.templateId, userId, ["OWNER", "ADMIN"]);
    const [deletedItem] = await db
      .delete(datastream)
      .where(eq(datastream.id, id))
      .returning();
    return deletedItem;
  },
};
