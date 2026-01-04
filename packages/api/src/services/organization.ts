import { and, db, eq } from "@artery/db";
import { organization, organizationMember } from "@artery/db/schema/organization";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(5, "Organization name is required"),
  slug: z.string().min(5, "Slug is required"),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.extend({
  id: z.string(),
});

export async function assertMemberRole(
  userId: string,
  organizationId: string,
  requiredRoles: ("OWNER" | "ADMIN" | "MEMBER")[],
) {
  const member = await db.query.organizationMember.findFirst({
    columns: { role: true },
    where: and(
      eq(organizationMember.userId, userId),
      eq(organizationMember.organizationId, organizationId),
    ),
  });

  if (!member) {
    throw new TRPCError({
      message: "Organization not found or you're not a member.",
      code: "FORBIDDEN",
    });
  }

  if (!requiredRoles.includes(member.role)) {
    throw new TRPCError({
      message: "You do not have permission to perform this action.",
      code: "FORBIDDEN",
    });
  }

  return member;
}

export const organizationService = {
  getAll: async (userId: string) => {
    return await db.query.organizationMember.findMany({
      columns: { role: true },
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
      where: eq(organizationMember.userId, userId),
    });
  },
  getById: async (userId: string, organizationId: string) => {
    const member = await db.query.organizationMember.findFirst({
      where: and(
        eq(organizationMember.organizationId, organizationId),
        eq(organizationMember.userId, userId),
      ),
      with: { organization: true },
    });

    if (!member?.organization) {
      throw new TRPCError({
        message: "Organization not found or you're not a member.",
        code: "FORBIDDEN",
      });
    }
    return member.organization;
  },
  create: async (userId: string, data: z.infer<typeof createOrganizationSchema>) => {
    return await db.transaction(async (tx) => {
      const [orgRow] = await tx
        .insert(organization)
        .values({ ...data, ownerId: userId })
        .returning();

      if (!orgRow)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });

      await tx.insert(organizationMember).values({
        organizationId: orgRow.id,
        userId,
        role: "OWNER",
      });

      return orgRow;
    });
  },
  update: async (
    userId: string,
    orgId: string,
    data: z.infer<typeof createOrganizationSchema>,
  ) => {
    await assertMemberRole(userId, orgId, ["OWNER", "ADMIN"]);

    const [result] = await db
      .update(organization)
      .set(data)
      .where(eq(organization.id, orgId))
      .returning();

    return result;
  },

  delete: async (userId: string, orgId: string) => {
    await assertMemberRole(userId, orgId, ["OWNER"]);

    const [result] = await db
      .delete(organization)
      .where(eq(organization.id, orgId))
      .returning();

    if (!result)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete",
      });

    return result;
  },
};
