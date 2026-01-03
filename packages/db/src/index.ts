import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

export * from "drizzle-orm";

import * as schema from "./schema";

export type DbClient = NodePgDatabase<typeof schema> & {
  $client: Pool;
};

export const db = drizzle(process.env.DATABASE_URL || "", { schema });
