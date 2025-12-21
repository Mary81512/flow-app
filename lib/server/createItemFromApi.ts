// lib/server/createItemFromApi.ts
import { createItem } from "@/lib/db/queries"

type ItemType = "auftrag" | "projekt"

type CreateItemFromApiInput = {
  id?: string
  type?: ItemType
  customerName?: string
  address?: string
  orderDate?: string
  code?: string
  billingAddress?: string
  contactName?: string
}

// kleine Helfer für ID
function makeId(type: ItemType) {
  return `${type === "auftrag" ? "A" : "P"}-${crypto.randomUUID().slice(0, 8)}`
}

// Hilfsfunktion: Namen für Code sinnvoll kürzen
function normalizeNameForCode(raw: string): string {
  let s = (raw ?? "").trim()
  if (!s) return "UNBEKANNT"

  // 1) Wenn Komma drin ist: alles vor dem ersten Komma
  const commaIdx = s.indexOf(",")
  if (commaIdx >= 0) {
    s = s.slice(0, commaIdx)
  }

  // 2) Firmen-Endungen entfernen
  const suffixes = [
    " gmbh & co. kg",
    " gmbh & co kg",
    " gmbh",
    " ug",
    " ag",
    " kg",
    " ohg",
    " e.k.",
    " e.k",
    " gbr",
    " e.v.",
    " ev",
  ]

  let lower = s.toLowerCase()
  for (const suf of suffixes) {
    if (lower.endsWith(suf)) {
      s = s.slice(0, s.length - suf.length)
      lower = s.toLowerCase()
      break
    }
  }

  // 3) Wenn Personenname: letzten Teil nehmen (Nachname)
  const parts = s.trim().split(/\s+/)
  if (parts.length > 1) {
    s = parts[parts.length - 1]
  }

  // 4) Umlaute / Sonderzeichen → Code-geeignet
  s = s
    .replace(/ä/gi, "ae")
    .replace(/ö/gi, "oe")
    .replace(/ü/gi, "ue")
    .replace(/ß/gi, "ss")

  s = s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  if (!s) s = "UNBEKANNT"

  return s.slice(0, 12)
}

// Code mit Datum bauen – Variante 1 (Nachname / Firmenkurzform)
function makeCode(type: ItemType, rawName: string, orderDate: string) {
  const d = new Date(orderDate)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)

  const base = normalizeNameForCode(rawName)
  const prefix = type === "auftrag" ? "A" : "P"

  return `${prefix}-${base}-${dd}${mm}${yy}`
}

export async function createItemFromApi(input: CreateItemFromApiInput) {
  const type: ItemType = input.type ?? "auftrag"

  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  let customerName = (input.customerName ?? "").trim()
  let address = (input.address ?? "").trim()
  let billingAddress = (input.billingAddress ?? "").trim()
  const contactName = (input.contactName ?? "").trim()

  // 📅 Datum: wenn leer → heute
  let orderDate = (input.orderDate ?? "").trim()
  if (!orderDate) {
    orderDate = today
  }

  // 👤 Kunde aus Rechnungsadresse ziehen, falls leer
  // z.B. "Herr Tal, Talstraße 8, 35353 Tal"
  if (!customerName && billingAddress) {
    const [maybeName] = billingAddress.split(",")
    customerName = (maybeName ?? "").trim()
  }

  // 🏠 Wenn noch keine Auftragsadresse, aber Rechnungsadresse vorhanden
  // → Auftragsadresse = Rechnungsadresse
  if (!address && billingAddress) {
    address = billingAddress
  }

  // Fallback: Kunde aus Auftragsadresse (falls z.B. "Müller, Musterstr. 1, Stadt")
  if (!customerName && address) {
    const [maybeName] = address.split(",")
    customerName = (maybeName ?? "").trim()
  }

  const id = input.id ?? makeId(type)

  // Name für Code wählen: am liebsten Kunde, sonst Rechnungsadresse, sonst Auftragsadresse
  const nameForCode = customerName || billingAddress || address || "UNBEKANNT"

  const finalCode =
    input.code && input.code.trim().length >= 3
      ? input.code.trim()
      : makeCode(type, nameForCode, orderDate)

  const createdAt = now.toISOString()
  const updatedAt = createdAt

  // Daten-Vollständigkeit
  const dataComplete =
    !!orderDate &&
    !!customerName &&
    !!address &&
    !!contactName &&
    !!billingAddress

  await createItem({
    id,
    type,
    code: finalCode,
    customer_name: customerName || "Unbekannt",
    contact_name: contactName || undefined,
    address: address || "—",
    order_date: orderDate,
    billing_address: billingAddress || null,   // ⬅️ WICHTIG: jetzt speichern wir es
    created_at: createdAt,
    updated_at: updatedAt,
    status: {
      data_complete: dataComplete,
      report_generated: false,
      invoice_written: false,
    },
  })

  return { id }
}
