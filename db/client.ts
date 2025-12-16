// db/client.ts
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Nur für lokale Entwicklung: TLS-Checks lockern,
// weil Supabase ein selbstsigniertes Zertifikat nutzt.
if (process.env.NODE_ENV === "development") {
  // ⚠️ Nicht für Produktion benutzen!
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL ist nicht gesetzt")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export const db = drizzle(pool, { schema })
export { schema }
