import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _pool: Pool | null = null;

export function getDb() {
  if (!_db) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

// Convenience export for Next.js (env is loaded by framework)
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

export type Database = ReturnType<typeof getDb>;
