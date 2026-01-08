import type { Context as HonoContext } from "hono";

import { auth } from "@artery/auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    session,
    context,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
