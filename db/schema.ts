// db/schema.ts
import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core"

// ITEMS
export const items = pgTable("items", {
  id: text("id").primaryKey(),

  type: text("type").notNull(),
  code: text("code").notNull(),

  customerName: text("customer_name").notNull(),
  address: text("address").notNull(),

  billingAddress: text("billing_address"),
  contactName: text("contact_name"),

  orderDate: text("order_date"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),

  statusDataComplete: boolean("status_data_complete")
    .notNull()
    .default(false),

  statusReportGenerated: boolean("status_report_generated")
    .notNull()
    .default(false),

  statusInvoiceWritten: boolean("status_invoice_written")
    .notNull()
    .default(false),
})

export type DBItem = typeof items.$inferSelect
export type NewDBItem = typeof items.$inferInsert

// FILES
export const files = pgTable("files", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: text("created_at").notNull(),
})

export type DBFile = typeof files.$inferSelect
export type NewDBFile = typeof files.$inferInsert

// LOGS
export const logs = pgTable("logs", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  time: text("time").notNull(),
  text: text("text").notNull(),
  source: text("source").notNull(),
})

export type DBLog = typeof logs.$inferSelect
export type NewDBLog = typeof logs.$inferInsert
