// lib/statusHelpers.ts
import type { Item, File } from "./types"
import { hasFileOfKind } from "./fileHelpers"
import {
  getInvoiceStateForItem,
  type InvoiceState,
} from "./invoiceStateStore"

export type TrafficLight = "red" | "yellow" | "green"

// ----------------------
// Basisdaten
// ----------------------
export function hasBaseData(item: Item): boolean {
  const hasCode = !!item.code && item.code.trim().length > 0
  const hasCustomer =
    !!item.customer_name && item.customer_name.trim().length > 0
  const hasAddress = !!item.address && item.address.trim().length > 0
  const hasDate = !!item.created_at && item.created_at.trim().length > 0

  return hasCode && hasCustomer && hasAddress && hasDate
}

// Today-/Detail-Logik
export function isBaseDataOkDetail(item: Item, files: File[]): boolean {
  if (!hasBaseData(item)) return false
  if (item.type === "auftrag") {
    return hasFileOfKind(files, "ticket")
  }
  return true
}

// ----------------------
// Status + Text
// ----------------------
export function getStatusWithInvoice(
  item: Item,
  files: File[],
  invoiceState: InvoiceState
): { text: string; trafficLight: TrafficLight } {
  const baseOk = isBaseDataOkDetail(item, files)
  const isProjekt = item.type === "projekt"
  const isAuftrag = item.type === "auftrag"

  const reportOk = hasFileOfKind(files, "report")
  const invoiceDone =
    invoiceState === "invoice" || invoiceState === "paid"

  const parts: string[] = []

  if (baseOk) {
    parts.push("Basisdaten vollständig")
  } else {
    parts.push("Basisdaten fehlen")
  }

  if (isProjekt) {
    parts.push(reportOk ? "Bericht vorhanden" : "Bericht fehlt")
  }

  parts.push(invoiceDone ? "Rechnung geschrieben" : "Rechnung fehlt")

  let traffic: TrafficLight = "red"

  if (!baseOk) {
    traffic = "red"
  } else if (isProjekt) {
    const allGood = baseOk && reportOk && invoiceDone
    traffic = allGood ? "green" : "yellow"
  } else if (isAuftrag) {
    const allGood = baseOk && invoiceDone
    traffic = allGood ? "green" : "yellow"
  } else {
    traffic = baseOk ? "yellow" : "red"
  }

  return { text: parts.join(" · "), trafficLight: traffic }
}

// ----------------------
// Style für Status-Pille
// ----------------------
export function getStatusPillStyle(traffic: TrafficLight) {
  if (traffic === "red") {
    return { backgroundColor: "#D46E6E" }
  }
  if (traffic === "green") {
    return { backgroundColor: "#6DCC62" }
  }
  return {
    backgroundImage: "linear-gradient(135deg, #6DCC62 50%, #FFE14D 50%)",
  }
}

// ----------------------
// Initialer Invoice-State
// ----------------------
export function getInitialInvoiceStateForItem(item: Item): InvoiceState {
  // Dein Store macht schon:
  //  - vorhandenen State liefern ODER
  //  - aus item.status.invoice_written einen Default ableiten
  return getInvoiceStateForItem(item)
}


export function isBaseDataOk(item: Item): boolean {
  const hasCode = !!item.code?.trim()
  const hasCustomer = !!item.customer_name?.trim()
  const hasAddress = !!item.address?.trim()
  const hasOrderDate = !!item.order_date?.trim()

  // falls du Rechnungsadresse Pflicht machen willst:
  const hasBilling = !!item.billing_address?.trim()
  return hasCode && hasCustomer && hasAddress && hasOrderDate && hasBilling

  return hasCode && hasCustomer && hasAddress && hasOrderDate
}
