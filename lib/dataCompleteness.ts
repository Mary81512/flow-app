// lib/dataCompleteness.ts
import type { Item } from "@/lib/types"

function hasText(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0
}

/**
 * Nur Stammdaten-Check:
 * -> beeinflusst NUR das ✓/! "Daten" in Today (und evtl. Listen wenn du willst)
 * -> KEINE Ampel/TrafficLight-Logik
 */
export function isItemDataComplete(item: Item): boolean {
  return (
    hasText(item.code) &&
    hasText(item.customer_name) &&
    hasText(item.address) &&           // Auftragsadresse
    hasText(item.order_date) &&
    hasText(item.billing_address) &&   // Rechnungsadresse
    hasText(item.contact_name)         // Ansprechpartner/Mieter
  )
}
