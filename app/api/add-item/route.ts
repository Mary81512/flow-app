// app/api/add-item/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/client"
import { items } from "@/db/schema"

// kleine Hilfsfunktion für IDs wie "N-<base36>"
function createItemId() {
  return `N-${Date.now().toString(36)}`
}

// Code nach deinem Schema bauen, wenn keins angegeben wurde
function buildCode(params: {
  type: "auftrag" | "projekt"
  customerName: string
  orderDate: string // "YYYY-MM-DD"
}) {
  const { type, customerName, orderDate } = params

  const prefix = type === "auftrag" ? "A" : "P"

  const cleanName = customerName
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9\-]/g, "")

  // 2025-01-23 -> 230125
  const datePart = orderDate
    .replaceAll("-", "")
    .slice(2) // 20250123 -> 250123

  return `${prefix}-${cleanName}-${datePart}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

        const {
      type,
      customerName,
      address,
      orderDate,
      code,
      billingAddress,
      contactName,
    } = body as {
      type?: "auftrag" | "projekt"
      customerName?: string
      address?: string
      orderDate?: string
      code?: string
      billingAddress?: string
      contactName?: string
    }


    if (!type || (type !== "auftrag" && type !== "projekt")) {
      return NextResponse.json(
        { error: "type muss 'auftrag' oder 'projekt' sein." },
        { status: 400 }
      )
    }

    // Pflichtfelder sind bei dir: Kunde, Adresse, Datum – aber
    // wir erlauben absichtlich leere Werte, damit die Ampel WARN sein kann.
    const safeCustomerName = customerName ?? ""
    const safeAddress = address ?? ""
    const safeOrderDate = orderDate ?? ""
    const safeBillingAddress = billingAddress ?? ""
    const safeContactName = contactName ?? ""

    const id = createItemId()
    const now = new Date().toISOString()

    const finalCode =
      code && code.trim().length > 0
        ? code.trim()
        : safeCustomerName && safeOrderDate
        ? buildCode({
            type,
            customerName: safeCustomerName,
            orderDate: safeOrderDate,
          })
        : // wenn wir nicht genug Infos haben, irgendeinen Platzhalter-Code
          `${type === "auftrag" ? "A" : "P"}-UNVOLLSTAENDIG-${id}`

    // hier entscheiden wir, ob "Daten komplett" true oder false ist:
    const dataComplete =
      safeCustomerName.trim().length > 0 &&
      safeAddress.trim().length > 0 &&
      safeOrderDate.trim().length > 0

    await db.insert(items).values({
      id,
      type,
      code: finalCode,
      customerName: safeCustomerName,
      address: safeAddress,
      orderDate: safeOrderDate || null,
      billingAddress: safeBillingAddress || null,
      contactName: safeContactName || null,
      createdAt: now,
      updatedAt: now,
      statusDataComplete: dataComplete,
      statusReportGenerated: false,
      statusInvoiceWritten: false,
    })

    return NextResponse.json(
      {
        id,
        type,
        code: finalCode,
        customerName: safeCustomerName,
        address: safeAddress,
        orderDate: safeOrderDate,
        statusDataComplete: dataComplete,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Fehler in /api/add-item:", error)
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    )
  }
}
