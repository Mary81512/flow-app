// db/client.ts
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

// WICHTIG: mit .ts-Endung
import * as schema from "./schema.ts"

// SQLite-File im db-Ordner
const sqlite = new Database("./db/sqlite.db")

// Drizzle-Client exportieren
export const db = drizzle(sqlite, { schema })

// optional: Schema mit exportieren, falls du es woanders brauchst
export { schema }

