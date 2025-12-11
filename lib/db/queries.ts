// lib/db/queries.ts
import { db } from "@/db/client"
import { items, files } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import type { Item, File, FileKind } from "@/lib/types"

// -----------------------------
// DB-Typen aus dem Schema
// -----------------------------
type DbItem = typeof items.$inferSelect
type DbFile = typeof files.$inferSelect

// DB-Row -> Frontend-Item mappen
function mapDbItem(row: DbItem): Item {
  return {
    id: row.id,
    type: row.type as Item["type"],
    code: row.code,
    customer_name: row.customerName,
    address: row.address,
    order_date: row.orderDate ?? "",
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    status: {
      data_complete: row.statusDataComplete,
      report_generated: row.statusReportGenerated,
      invoice_written: row.statusInvoiceWritten,
    },
  }
}

// DB-Row -> Frontend-File mappen
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

// -----------------------------
// Public Queries
// -----------------------------

// Alle Items nach Upload-Zeit sortiert (neueste zuerst)
export async function getItemsSortedByUploadTime(): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .orderBy(desc(items.createdAt))

  return rows.map(mapDbItem)
}

// Neueste Items (nach createdAt) – limit optional, Standard 20
export async function getLatestItems(limit = 20): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .orderBy(desc(items.createdAt))
    .limit(limit)

  return rows.map(mapDbItem)
}

// Alle Files zu einem Item
export async function getFilesOfItem(itemId: string): Promise<File[]> {
  const rows = await db
    .select()
    .from(files)
    .where(eq(files.itemId, itemId))

  return rows.map(mapDbFile)
}
