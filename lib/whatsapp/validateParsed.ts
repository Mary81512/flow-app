// lib/whatsapp/validateParsed.ts
import type { ParsedWhatsApp } from "./parseMessage"

export type MissingField =
  | "type"
  | "order_date"
  | "customer_name"
  | "address"
  | "contact_name"
  | "billing_address"

export type ValidatedWhatsApp = {
  type: "auftrag" | "projekt"
  order_date: string // YYYY-MM-DD
  customer_name: string
  contact_name: string
  address: string
  billing_name: string
  billing_address: string
  phone: string
  notes: string
  code: string // IMMER automatisch
}

const COMPANY_SUFFIXES = new Set([
  "GMBH",
  "MBH",
  "UG",
  "AG",
  "KG",
  "GBR",
  "OHG",
  "EV",
  "E.V",
  "EK",
  "E.K",
  "INC",
  "LTD",
  "LLC",
  "CO",
  "&",
])

function normalizeUmlauts(s: string) {
  return s
    .replace(/ä/gi, "ae")
    .replace(/ö/gi, "oe")
    .replace(/ü/gi, "ue")
    .replace(/ß/gi, "ss")
}

function cleanForTokens(s: string) {
  return normalizeUmlauts(s)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ") // Sonderzeichen -> Space
    .replace(/\s+/g, " ")
    .trim()
}

// ✅ VARIANTE 1: Person -> Nachname, Firma -> erstes Wort (ohne GmbH etc.)
function pickShortNameForCode(customerName: string) {
  const base = cleanForTokens(customerName)
  const parts = base
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !COMPANY_SUFFIXES.has(p))

  if (parts.length === 0) return "UNBEKANNT"

  // Heuristik: 2 Wörter => Person => Nachname
  if (parts.length === 2) return parts[1]

  // sonst Firma / längerer Name => erstes Wort
  return parts[0]
}

function makeCode(type: "auftrag" | "projekt", customerName: string, orderDate: string) {
  // A-MEIER-230125
  const d = new Date(orderDate)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)

  const namePart = pickShortNameForCode(customerName)
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12)

  return `${type === "auftrag" ? "A" : "P"}-${namePart}-${dd}${mm}${yy}`
}

export function validateParsed(p: ParsedWhatsApp) {
  const missing: MissingField[] = []

  // Missing-Liste wie bisher (für WARN)
  if (!p.type) missing.push("type")
  if (!p.order_date) missing.push("order_date")
  if (!p.customer_name) missing.push("customer_name")
  if (!p.address) missing.push("address")

  // so wie du es kommentiert hast: “später obligatorisch”
  if (!p.contact_name) missing.push("contact_name")
  if (!p.billing_address) missing.push("billing_address")

  // Defaults, damit wir trotzdem anlegen können
  const type: "auftrag" | "projekt" = p.type ?? "auftrag"
  const order_date = p.order_date ?? new Date().toISOString().slice(0, 10)
  const customer_name = (p.customer_name ?? "Unbekannt").trim()
  const address = (p.address ?? "—").trim()

  const contact_name = (p.contact_name ?? "").trim()
  const billing_address = (p.billing_address ?? "").trim()
  const billing_name = (p.billing_name ?? "").trim()
  const phone = (p.phone ?? "").trim()
  const notes = (p.notes ?? "").trim()

  const code = makeCode(type, customer_name, order_date)

  const validated: ValidatedWhatsApp = {
    type,
    order_date,
    customer_name,
    contact_name,
    address,
    billing_name,
    billing_address,
    phone,
    notes,
    code,
  }

  return { ok: missing.length === 0, missing, validated }
}

