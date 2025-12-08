// lib/codeHelpers.ts
import type { Item, ItemType } from "./types"

/**
 * Kundennamen für den Code “säubern”
 * - Großbuchstaben
 * - Leerzeichen raus
 * - Sonderzeichen raus
 *   (für echten Betrieb könnten wir später mal Umlaute schön mappen)
 */
function normalizeCustomerForCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "") // alle Spaces raus
    .replace(/[^A-Z0-9]/g, "") // alles weg, was kein A–Z oder 0–9 ist
}

/**
 * Aus Typ + Kunde + Auftragsdatum den STAMM bauen:
 *  A-MARCREITZ-20251104  oder
 *  P-NIKE-20250301
 *
 * orderDate: "YYYY-MM-DD"
 */
export function buildCodeStem(
  type: ItemType,
  customerName: string,
  orderDate: string
): string {
  const prefix = type === "auftrag" ? "A" : "P"

  const customerPart = normalizeCustomerForCode(customerName)

  // Wir nehmen das Datum im Format YYYYMMDD aus order_date
  const datePart = orderDate.replace(/-/g, "") // "2025-11-04" -> "20251104"

  return `${prefix}-${customerPart}-${datePart}`
}

/**
 * Nimmt Typ + Kunde + Auftragsdatum + alle existierenden Items
 * und erzeugt einen eindeutigen Code:
 *
 *  - erster Auftrag mit dem Stamm:  A-MARCREITZ-20251104
 *  - zweiter Auftrag gleichen Stamms: A-MARCREITZ-20251104-01
 *  - dritter:                         A-MARCREITZ-20251104-02
 */
export function generateCodeForItem(
  type: ItemType,
  customerName: string,
  orderDate: string,
  existingItems: Item[]
): string {
  const stem = buildCodeStem(type, customerName, orderDate)

  // alle Items mit genau diesem Stamm
  const siblings = existingItems.filter((i) => {
    const { stem: s } = splitCode(i.code)
    return s === stem
  })

  // wenn noch kein Item mit diesem Stamm existiert → Stamm ohne Suffix
  if (siblings.length === 0) {
    return stem
  }

  // vorhandene Suffix-Zahlen finden
  const numbers = siblings
    .map((i) => splitCode(i.code).suffix)
    .filter((s): s is string => !!s)
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n))

  const nextNumber = (numbers.length ? Math.max(...numbers) : 0) + 1
  const suffix = formatSuffix(nextNumber)

  return `${stem}-${suffix}`
}

// ------------------------------------------------------
// Anzeige-Helfer (dein bestehender Teil)
// ------------------------------------------------------

// Code in Stamm + optional Suffix trennen
export function splitCode(code: string) {
  const parts = code.split("-")

  if (parts.length === 4) {
    return {
      stem: `${parts[0]}-${parts[1]}-${parts[2]}`,
      suffix: parts[3],
    }
  }

  return {
    stem: code,
    suffix: null as string | null,
  }
}

export function formatSuffix(n: number): string {
  return n.toString().padStart(2, "0")
}

// Anzeige-Code mit optionalem -01 / -02
export function getDisplayCode(item: Item, allItems: Item[]): string {
  const { stem } = splitCode(item.code)

  // alle Items mit gleichem Stamm finden
  const group = allItems.filter((i) => {
    const { stem: s } = splitCode(i.code)
    return s === stem
  })

  if (group.length === 1) {
    return stem
  }

  const sorted = group.slice().sort((a, b) => a.code.localeCompare(b.code))
  const index = sorted.indexOf(item)
  const safeIndex = index === -1 ? 0 : index
  const suffix = formatSuffix(safeIndex + 1)

  return `${stem}-${suffix}`
}

