// lib/whatsapp/validateParsed.ts
import type { ParsedWhatsApp } from "./parseMessage"

export type MissingField =
  | "type"
  | "order_date"
  | "customer_name"
  | "address"
  | "contact_name"
  | "billing_address"

export function validateParsed(p: ParsedWhatsApp) {
  const missing: MissingField[] = []

  if (!p.type) missing.push("type")
  if (!p.order_date) missing.push("order_date")
  if (!p.customer_name) missing.push("customer_name")
  if (!p.address) missing.push("address")

  // Das hast du explizit gesagt: später obligatorisch:
  if (!p.contact_name) missing.push("contact_name")
  if (!p.billing_address) missing.push("billing_address")

  return { ok: missing.length === 0, missing }
}
