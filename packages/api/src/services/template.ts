import { and, db, eq } from "@artery/db";
import { template } from "@artery/db/schema/template";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(5, "Template name is required"),
  hardwarePlatform: z.string().min(1, "Hardware platform is required"),
  connectionType: z.string().min(1, "Connection type is required"),
  description: z.string().optional(),
});

export const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string().min(12, "Id is required"),
});

export const templateService = {
  getAll: async (orgId: string) => {
    const templates = await db.query.template.findMany({
      where: eq(template.organizationId, orgId),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return templates;
  },
  getById: async (organizationId: string, templateId: string) => {
    const templateDetail = await db.query.template.findFirst({
      where: and(
        eq(template.id, templateId),
        eq(template.organizationId, organizationId),
      ),
    });

    if (!templateDetail) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Template tidak ditemukan di organisasi ini.",
      });
    }

    return templateDetail;
  },
  create: async (
    userId: string,
    data: z.infer<typeof createTemplateSchema> & { organizationId: string },
  ) => {
    const [templateRow] = await db
      .insert(template)
      .values({
        ...data,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    if (!templateRow) {
      throw new TRPCError({
        message: "Unable to create template",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return templateRow;
  },
  update: async (
    activeOrgId: string,
    userId: string,
    data: z.infer<typeof updateTemplateSchema>,
  ) => {
    const tmpl = await db.query.template.findFirst({
      where: and(eq(template.id, data.id), eq(template.organizationId, activeOrgId)),
    });

    if (!tmpl) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Template not found",
      });
    }

    const { id, ...updateData } = data;
    const [result] = await db
      .update(template)
      .set({
        ...updateData,
        updatedBy: userId,
      })
      .where(and(eq(template.id, tmpl.id), eq(template.organizationId, activeOrgId)))
      .returning();

    return result;
  },
  delete: async (activeOrgId: string, templateId: string) => {
    const tmpl = await db.query.template.findFirst({
      where: and(
        eq(template.id, templateId),
        eq(template.organizationId, activeOrgId),
      ),
    });

    if (!tmpl) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Template not found",
      });
    }

    const [result] = await db
      .delete(template)
      .where(eq(template.id, templateId))
      .returning();

    if (!result)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete",
      });

    return result;
  },
};
