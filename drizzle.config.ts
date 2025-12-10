// drizzle.config.ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",   // hier wird gleich unser Schema liegen
  out: "./drizzle",           // hier legt drizzle die Migrations ab
  dbCredentials: {
    // Datei-basierte SQLite-DB im Ordner "db"
    url: "./db/sqlite.db",
  },
})
