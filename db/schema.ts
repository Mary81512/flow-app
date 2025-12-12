// db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

// -----------------------------
// ITEMS
// -----------------------------

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),

  // "auftrag" | "projekt"
  type: text("type").notNull(),

  // z.B. "A-REITZ-041125"
  code: text("code").notNull(),

  // Anzeige für Kunde (kann Firma oder Person sein)
  customerName: text("customer_name").notNull(),

  // Auftragsadresse (die, wo der Monteur hinfährt)
  address: text("address").notNull(),

  billingAddress: text("billing_address"), // Rechnungsadresse (optional)
  contactName: text("contact_name"),  

  // optionales Feld fürs Auftragsdatum, z.B. "2025-11-25"
  // (falls du es schon in deinen Items benutzt)
  orderDate: text("order_date"),

  // Zeitstempel (ISO-Strings)
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),

  // Status-Flags aus ItemStatus
  statusDataComplete: integer("status_data_complete", {
    mode: "boolean",
  })
    .notNull()
    .default(false),

  statusReportGenerated: integer("status_report_generated", {
    mode: "boolean",
  })
    .notNull()
    .default(false),

  statusInvoiceWritten: integer("status_invoice_written", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
})

// Type-Hilfen (optional, aber praktisch)
export type DBItem = typeof items.$inferSelect
export type NewDBItem = typeof items.$inferInsert

// -----------------------------
// FILES
// -----------------------------

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),

  // Verknüpfung zu items.id
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),

  // "ticket" | "report" | "logdata" | "picture" | "video" | "other"
  kind: text("kind").notNull(),

  filename: text("filename").notNull(),
  url: text("url").notNull(),

  sizeBytes: integer("size_bytes").notNull(),

  createdAt: text("created_at").notNull(),
})

export type DBFile = typeof files.$inferSelect
export type NewDBFile = typeof files.$inferInsert

// -----------------------------
// LOGS
// -----------------------------

export const logs = sqliteTable("logs", {
  id: text("id").primaryKey(),

  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),

  time: text("time").notNull(),

  text: text("text").notNull(),

  // "manual" | "whatsapp" | "system"
  source: text("source").notNull(),
})

export type DBLog = typeof logs.$inferSelect
export type NewDBLog = typeof logs.$inferInsert
