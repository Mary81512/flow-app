// db/client.ts
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL ist nicht gesetzt")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // 🔥 Supabase-SSL: self-signed Zertifikat zulassen (nur DEV!)
    rejectUnauthorized: false,
  },
})

export const db = drizzle(pool, { schema })
export { schema }
