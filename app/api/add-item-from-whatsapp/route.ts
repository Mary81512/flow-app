// app/api/add-item-from-whatsapp/route.ts
import { NextResponse } from "next/server"
import { parseWhatsAppMessage } from "@/lib/whatsapp/parseMessage"
import { validateParsed } from "@/lib/whatsapp/validateParsed"
import { createItemFromApi } from "@/lib/server/createItemFromApi"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string }
    const text = body.text?.trim()

    if (!text) {
      return NextResponse.json(
        { error: "Kein WhatsApp-Text übergeben." },
        { status: 400 }
      )
    }

    const parsed = parseWhatsAppMessage(text)
    const { missing } = validateParsed(parsed)

    // Wir reichen nur die Rohdaten weiter – alle Fallbacks / Code-Generierung
    // passieren in createItemFromApi
    const { id } = await createItemFromApi({
      type: parsed.type,
      customerName: parsed.customer_name,
      address: parsed.address,
      orderDate: parsed.order_date,
      billingAddress: parsed.billing_address,
      contactName: parsed.contact_name,
      code: parsed.code,
    })

    return NextResponse.json({ id, missing })
  } catch (e) {
    console.error("❌ Fehler beim WhatsApp-Import:", e)
    return NextResponse.json(
      { error: "Fehler beim WhatsApp-Import." },
      { status: 500 }
    )
  }
}

