import { and, db, eq } from "@artery/db";
import {
  organization,
  organizationMember,
} from "@artery/db/schema/organization";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { protectedProcedure, router } from "../index";

export const organizationRouter = router({
  // Retrieves all workspaces for the authenticated user
  all: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
    const { userId } = ctx.session.session;

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
  }),
  byId: protectedProcedure
    .input(z.object({ orgId: z.string().min(12) }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      const member = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.organizationId, input.orgId),
          eq(organizationMember.userId, userId),
        ),
        with: {
          organization: {
            columns: {
              id: true,
              name: true,
              slug: true,
              description: true,
              ownerId: true,
            },
          },
        },
      });

      if (!member?.organization) {
        throw new TRPCError({
          message: "Organization not found or you're not a member.",
          code: "FORBIDDEN",
        });
      }

      return member.organization;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(5, "Organization name is required"),
        slug: z.string().min(5, "Slug is required"),
        description: z.string().optional(),
        logo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      return await db.transaction(async (tx) => {
        const [orgRow] = await tx
          .insert(organization)
          .values({
            ...input,
            ownerId: userId,
          })
          .returning();

        if (!orgRow) {
          throw new TRPCError({
            message: "Unable to create organization",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        await tx.insert(organizationMember).values({
          organizationId: orgRow.id,
          userId,
          role: "OWNER",
        });

        return orgRow;
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(12),
        name: z.string().min(5, "Organization name is required"),
        slug: z.string().min(5, "Slug is required"),
        description: z.string().optional(),
        logo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      const member = await db.query.organizationMember.findFirst({
        columns: { role: true },
        where: and(
          eq(organizationMember.userId, userId),
          eq(organizationMember.organizationId, input.id),
        ),
      });

      if (!member) {
        throw new TRPCError({
          message: "Organization not found or you're not a member.",
          code: "FORBIDDEN",
        });
      }

      if (member.role !== "ADMIN" && member.role !== "OWNER") {
        throw new TRPCError({
          message: "Only admin or owner can modify this organization.",
          code: "FORBIDDEN",
        });
      }

      const [result] = await db
        .update(organization)
        .set({
          name: input.name,
          slug: input.slug,
          description: input.description,
          logo: input.logo,
        })
        .where(eq(organization.id, input.id))
        .returning();

      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session.session;

      const member = await db.query.organizationMember.findFirst({
        columns: { role: true },
        where: and(
          eq(organizationMember.userId, userId),
          eq(organizationMember.organizationId, input.id),
        ),
      });

      if (!member || member.role !== "OWNER") {
        throw new TRPCError({
          message: "Only the owner can delete this organization.",
          code: "FORBIDDEN",
        });
      }

      const [result] = await db
        .delete(organization)
        .where(eq(organization.id, input.id))
        .returning();

      if (!result) {
        throw new TRPCError({
          message: "Unable to delete organization",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return result;
    }),
});
