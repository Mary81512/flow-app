// lib/whatsapp/parseMessage.ts
export type ParsedWhatsApp = {
  type?: "auftrag" | "projekt"
  order_date?: string // YYYY-MM-DD
  customer_name?: string // Rechnungskunde (Firma)
  contact_name?: string // Ansprechpartner / Mieter
  address?: string // Auftragsadresse
  billing_name?: string
  billing_address?: string
  phone?: string
  notes?: string
  code?: string 
}

export function parseWhatsAppMessage(text: string): ParsedWhatsApp {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const out: ParsedWhatsApp = {}

  // Sehr simples "Key: Value" Parsing (stabil & erweiterbar)
  for (const line of lines) {
    const m = line.match(/^([A-Za-zÄÖÜäöüß ]{1,30})\s*:\s*(.+)$/)
    if (!m) continue

    const keyRaw = m[1].trim().toLowerCase()
    const val = m[2].trim()

    const key = keyRaw
      .replace("ä", "ae")
      .replace("ö", "oe")
      .replace("ü", "ue")
      .replace("ß", "ss")

    if (key === "typ" || key === "type") {
      if (val.toLowerCase().startsWith("a")) out.type = "auftrag"
      if (val.toLowerCase().startsWith("p")) out.type = "projekt"
    }

    
if (key === "datum" || key === "order_date" || key === "auftragsdatum") {
  // akzeptiert:
  // 2025-12-12
  // 12.12.2025
  // 12.12.25
  // 12/12/2025
  // 12/12/25
  const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const deLong = val.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  const deShort = val.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/)
  const slashLong = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  const slashShort = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)

  if (iso) out.order_date = val

  if (deLong) {
    const dd = deLong[1].padStart(2, "0")
    const mm = deLong[2].padStart(2, "0")
    out.order_date = `${deLong[3]}-${mm}-${dd}`
  }

  if (deShort) {
    const dd = deShort[1].padStart(2, "0")
    const mm = deShort[2].padStart(2, "0")
    const yyyy = `20${deShort[3]}`
    out.order_date = `${yyyy}-${mm}-${dd}`
  }

  if (slashLong) {
    const dd = slashLong[1].padStart(2, "0")
    const mm = slashLong[2].padStart(2, "0")
    out.order_date = `${slashLong[3]}-${mm}-${dd}`
  }

  if (slashShort) {
    const dd = slashShort[1].padStart(2, "0")
    const mm = slashShort[2].padStart(2, "0")
    const yyyy = `20${slashShort[3]}`
    out.order_date = `${yyyy}-${mm}-${dd}`
  }
}

    if (key === "kunde" || key === "rechnungskunde") out.customer_name = val
    if (key === "ap" || key === "ansprechpartner" || key === "mieter")
      out.contact_name = val

    if (key === "adresse" || key === "auftragsadresse") out.address = val

    if (key === "rechnungsadresse") out.billing_address = val
    if (key === "rechnungsname" || key === "rechnungkunde")
      out.billing_name = val

    if (key === "telefon" || key === "phone") out.phone = val
    if (key === "notiz" || key === "notes") out.notes = val
  }
  // -----------------------------
  // Fallbacks / Auto-Ableitungen
  // -----------------------------

  // 1) Wenn Rechnungsadresse "NAME, REST..." ist,
  //    dann NAME als billing_name + (falls Kunde fehlt) customer_name übernehmen
  if (out.billing_address && !out.billing_name) {
    const parts = out.billing_address
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)

    if (parts.length >= 2) {
      const first = parts[0]
      const rest = parts.slice(1).join(", ").trim()

      // Heuristik: erster Teil darf keine Ziffern enthalten (damit "Musterweg 9" nicht als Name gilt)
      const firstLooksLikeName = first.length >= 2 && !/\d/.test(first)

      if (firstLooksLikeName) {
        out.billing_name = first
        out.billing_address = rest
      }
    }
  }

  // 2) Wenn Kunde fehlt, aber billing_name existiert → Kunde daraus ableiten
  if (!out.customer_name && out.billing_name) {
    out.customer_name = out.billing_name
  }
  
  return out
}
