// db/seed.ts
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

import * as schema from "./schema.ts"
import { items as rawItems, files as rawFiles, logs as rawLogs } from "./mockData.ts"
import type { Item, File, LogEntry } from "../lib/types.ts"

// SQLite-Verbindung + Drizzle-Client
const sqlite = new Database("./db/sqlite.db")
const db = drizzle(sqlite, { schema })

async function seed() {
  console.log("🔄 Alte Daten löschen …")
  await db.delete(schema.logs)
  await db.delete(schema.files)
  await db.delete(schema.items)

  // ----------------------------------
  // Items in DB-Shape mappen
  // ----------------------------------
  const mockItems = (rawItems as Item[]).map((item) => ({
    id: item.id,
    type: item.type,
    code: item.code,
    customerName: item.customer_name,
    address: item.address,
    orderDate: item.order_date,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    statusDataComplete: item.status.data_complete,
    statusReportGenerated: item.status.report_generated,
    statusInvoiceWritten: item.status.invoice_written,
  }))

  const mockFiles = (rawFiles as File[]).map((f) => ({
    id: f.id,
    itemId: f.item_id,
    kind: f.kind,
    filename: f.filename,
    url: f.url,
    sizeBytes: f.size_bytes,
    createdAt: f.created_at,
  }))

  const mockLogs = (rawLogs as LogEntry[]).map((l) => ({
    id: l.id,
    itemId: l.item_id,
    text: l.text,
    time: l.time,
    source: l.source,
  }))

  // ----------------------------------
  // Einfügen
  // ----------------------------------
  if (mockItems.length > 0) {
    await db.insert(schema.items).values(mockItems)
    console.log(`✔ ${mockItems.length} Items eingefügt`)
  }

  if (mockFiles.length > 0) {
    await db.insert(schema.files).values(mockFiles)
    console.log(`✔ ${mockFiles.length} Files eingefügt`)
  }

  if (mockLogs.length > 0) {
    await db.insert(schema.logs).values(mockLogs)
    console.log(`✔ ${mockLogs.length} Logs eingefügt`)
  }

  console.log("🎉 Seed fertig!")
  process.exit(0)
}

seed().catch((error) => {
  console.error("❌ Fehler beim Seeden:", error)
  process.exit(1)
})
