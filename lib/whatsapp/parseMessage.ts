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
      // akzeptiert: 2025-12-12 oder 12.12.2025
      const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      const de = val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
      if (iso) out.order_date = val
      if (de) out.order_date = `${de[3]}-${de[2]}-${de[1]}`
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

  return out
}
