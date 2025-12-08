// lib/invoiceStateStore.ts
import type { Item } from "./types"

export type InvoiceState = "none" | "invoice" | "paid"

// kleiner In-Memory-Store pro Browser-Tab
const invoiceStateByItem = new Map<string, InvoiceState>()

/**
 * Liefert den aktuellen Rechnungs-Status für ein Item.
 * Falls wir noch keinen gespeicherten Wert haben, wird
 * ein Default aus item.status abgeleitet.
 */
export function getInvoiceStateForItem(item: Item): InvoiceState {
  const existing = invoiceStateByItem.get(item.id)
  if (existing) return existing

  // Default aus den Item-Stammdaten ableiten
  const initial: InvoiceState = item.status.invoice_written ? "paid" : "none"
  invoiceStateByItem.set(item.id, initial)
  return initial
}

/**
 * Speichert den Rechnungs-Status für ein Item im Store.
 */
export function setInvoiceStateForItem(
  itemId: string,
  state: InvoiceState
): void {
  invoiceStateByItem.set(itemId, state)
}
