import { drizzle } from "drizzle-orm/node-postgres";

export * from "drizzle-orm";

import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL || "", { schema });
