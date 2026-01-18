import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";
import { db } from "@artery/db";
import { auth } from "@artery/auth";

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

export const organizationProcedure = protectedProcedure.use(async ({ ctx, next }) => {
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
      activeOrgId,
      memberRole: member.role,
    },
  });
});

export const deviceProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.context) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Missing context",
    });
  }
  const authHeader = ctx.context.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.substring(7);
  const device = await db.query.device.findFirst({
    where: (table, { eq }) => eq(table.authToken, token),
  });

  if (!device) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  return next({
    ctx: {
      ...ctx,
      device,
    },
  });
});

export const requirePermission = (permissions: { [resource: string]: string[] }) => {
  return organizationProcedure.use(async ({ ctx, next }) => {
    const hasPermission = await auth.api.hasPermission({
      headers: ctx.context.req.raw.headers, // Pass actual headers
      body: {
        permissions,
        organizationId: ctx.activeOrgId, // Explicitly pass organizationId
      },
    });

    if (!hasPermission?.success) {
      throw new TRPCError({
        message: "You do not have permission to perform this action.",
        code: "FORBIDDEN",
      });
    }

    return next({ ctx });
  });
};

export const canCreateTemplate = requirePermission({ template: ["create"] });
export const canUpdateTemplate = requirePermission({ template: ["update"] });
export const canDeleteTemplate = requirePermission({ template: ["delete"] });

export const canCreateDatastream = requirePermission({ datastream: ["create"] });
export const canUpdateDatastream = requirePermission({ datastream: ["update"] });
export const canDeleteDatastream = requirePermission({ datastream: ["delete"] });

export const canCreateDevice = requirePermission({ device: ["create"] });
export const canUpdateDevice = requirePermission({ device: ["update"] });
export const canDeleteDevice = requirePermission({ device: ["delete"] });
