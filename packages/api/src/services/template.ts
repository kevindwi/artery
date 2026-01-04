import { and, db, eq } from "@artery/db";
import { template } from "@artery/db/schema/template";
import { TRPCError } from "@trpc/server";
import { assertMemberRole } from "./organization";
import z from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(5, "Template name is required"),
  organizationId: z.string().min(12, "Id is required"),
  hardwarePlatform: z.string().min(1, "Hardware platform is required"),
  connectionType: z.string().min(1, "Connection type is required"),
  description: z.string().optional(),
});

export const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string().min(12, "Id is required"),
});

export const templateService = {
  getAll: async (userId: string, orgId: string) => {
    await assertMemberRole(userId, orgId, ["OWNER", "ADMIN", "MEMBER"]);

    return await db.query.template.findMany({
      where: eq(template.organizationId, orgId),
    });
  },
  getById: async (
    userId: string,
    organizationId: string,
    templateId: string,
  ) => {
    await assertMemberRole(userId, organizationId, ["OWNER", "ADMIN", "MEMBER"]);

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
    data: z.infer<typeof createTemplateSchema>,
  ) => {
    await assertMemberRole(userId, data.organizationId, [
      "OWNER",
      "ADMIN",
      "MEMBER",
    ]);

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
    userId: string,
    templateId: string,
    data: z.infer<typeof createTemplateSchema>,
  ) => {
    await assertMemberRole(userId, data.organizationId, ["OWNER", "ADMIN"]);

    const [result] = await db
      .update(template)
      .set(data)
      .where(eq(template.id, templateId))
      .returning();

    return result;
  },
  delete: async (userId: string, templateId: string) => {
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

    await assertMemberRole(userId, tmpl.organizationId, ["OWNER"]);

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
