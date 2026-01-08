import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";
import { db } from "@artery/db";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const organizationProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }

  const activeOrgId = ctx.session.session.activeOrganizationId;
  const userId = ctx.session.session.userId;

  if (!activeOrgId) {
    throw new TRPCError({
      message: "Organization not found or you're not a member.",
      code: "FORBIDDEN",
    });
  }

  const member = await db.query.member.findFirst({
    columns: { role: true },
    where: (table, { eq, and }) =>
      and(eq(table.userId, userId), eq(table.organizationId, activeOrgId)),
  });

  if (!member) {
    throw new TRPCError({
      message: "Organization not found or you're not a member.",
      code: "FORBIDDEN",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      activeOrgId,
      memberRole: member.role,
    },
  });
});
