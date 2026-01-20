import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
  plugins: [organizationClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
