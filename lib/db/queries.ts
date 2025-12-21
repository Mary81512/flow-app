// lib/db/queries.ts
import { db } from "@/db/client"
import { items, files, logs } from "@/db/schema"
import { desc, asc, eq } from "drizzle-orm"
import type { Item, File, LogEntry, FileKind } from "@/lib/types"

// DB-Typen
type DbItem = typeof items.$inferSelect
type DbFile = typeof files.$inferSelect
type DbLog = typeof logs.$inferSelect

// ------------------------
// Mapper: DB → Frontend
// ------------------------
function mapDbItem(row: DbItem): Item {
  return {
    id: row.id,
    type: row.type as Item["type"],
    code: row.code,
    customer_name: row.customerName,
    address: row.address,
    order_date: row.orderDate ?? "",
    billing_address: row.billingAddress ?? null,
    contact_name: row.contactName ?? null,

    created_at: row.createdAt,
    updated_at: row.updatedAt,

    status: {
      data_complete: row.statusDataComplete,
      report_generated: row.statusReportGenerated,
      invoice_written: row.statusInvoiceWritten,
    },
  }
}

function mapDbFile(row: DbFile): File {
  return {
    id: row.id,
    item_id: row.itemId,
    kind: row.kind as FileKind,
    filename: row.filename,
    url: row.url,
    size_bytes: row.sizeBytes,
    created_at: row.createdAt,
  }
}

function mapDbLog(row: DbLog): LogEntry {
  return {
    id: row.id,
    item_id: row.itemId,
    text: row.text,
    time: row.time,
    source: row.source as LogEntry["source"],
  }
}

// ------------------------
// Abfragen
// ------------------------

// Today / Listen: neueste Items
export async function getLatestItems(limit = 20): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .orderBy(desc(items.createdAt))
    .limit(limit)

  return rows.map(mapDbItem)
}
// Alle Items für ein bestimmtes Auftragsdatum (YYYY-MM-DD),
// sortiert nach Upload-Zeit (createdAt) – NEUESTE zuerst
export async function getItemsForOrderDate(
  orderDate: string
): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.orderDate, orderDate))
    .orderBy(desc(items.createdAt)) // neueste oben

  return rows.map(mapDbItem)
}



// Detail: einzelnes Item
export async function getItemById(id: string): Promise<Item | null> {
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.id, id))
    .limit(1)

  const row = rows[0]
  return row ? mapDbItem(row) : null
}

// Dateien zu einem Item
export async function getFilesOfItem(itemId: string): Promise<File[]> {
  const rows = await db
    .select()
    .from(files)
    .where(eq(files.itemId, itemId))
    .orderBy(desc(files.createdAt))

  return rows.map(mapDbFile)
}

// Logs zu einem Item
export async function getLogsOfItem(itemId: string): Promise<LogEntry[]> {
  const rows = await db
    .select()
    .from(logs)
    .where(eq(logs.itemId, itemId))
    .orderBy(asc(logs.time))

  return rows.map(mapDbLog)
}

// Alle Aufträge (type="auftrag"), sortiert nach Auftragsdatum + Uploadzeit (neueste oben)
export async function getAuftraege(): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.type, "auftrag"))
    .orderBy(desc(items.orderDate), desc(items.createdAt))

  return rows.map(mapDbItem)
}


// Alle Projekte (type="projekt"), sortiert nach Auftragsdatum + Uploadzeit
export async function getProjekte(): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.type, "projekt"))
    .orderBy(desc(items.orderDate), desc(items.createdAt))

  return rows.map(mapDbItem)
}

type NewItemInput = {
  id: string
  type: "auftrag" | "projekt"
  code: string
  customer_name: string
  contact_name?: string
  address: string
  order_date: string
  billing_address?: string | null
  created_at: string
  updated_at: string
  status: {
    data_complete: boolean
    report_generated: boolean
    invoice_written: boolean
  }
}

export async function createItem(input: NewItemInput) {
  await db.insert(items).values({
    id: input.id,
    type: input.type,
    code: input.code,
    customerName: input.customer_name,
    // falls du contactName schon in schema hast:
    contactName: input.contact_name ?? null,
    address: input.address,
    orderDate: input.order_date,
    billingAddress: input.billing_address ?? null, 
    createdAt: input.created_at,
    updatedAt: input.updated_at,
    statusDataComplete: input.status.data_complete,
    statusReportGenerated: input.status.report_generated,
    statusInvoiceWritten: input.status.invoice_written,
  })
}