import { db, eq } from "@artery/db";
import * as schema from "@artery/db/schema/index";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Find the first organization where the user is a member
          const membership = await db.query.member.findFirst({
            where: eq(schema.member.userId, session.userId),
            columns: { organizationId: true },
          });

          // Set the active organization ID if found
          if (membership) {
            return {
              data: {
                ...session,
                activeOrganizationId: membership.organizationId,
              },
            };
          }

          return { data: session };
        },
      },
    },
    user: {
      create: {
        after: async (user) => {
          // Create organization for the new user
          const orgName = `${user.name || 'User'}'s Organization`;
          const orgSlug = `org-${user.id.slice(0, 5)}`;

          const data = await auth.api.createOrganization({
            body: {
              name: orgName,
              slug: orgSlug,
              userId: user.id,
            },
          });

          if (!data) {
            throw new Error("Failed to create organization");
          }

        },
      },
    },
  },
  plugins: [
    organization({
      ac,
      roles: { owner, admin, member },
    }),
    openAPI(),
  ],
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});
