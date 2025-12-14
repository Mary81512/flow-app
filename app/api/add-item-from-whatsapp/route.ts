import { NextResponse } from "next/server"
import { parseWhatsAppMessage } from "@/lib/whatsapp/parseMessage"
import { validateParsed } from "@/lib/whatsapp/validateParsed"

function nowIso() {
  return new Date().toISOString()
}

// super simple id generator (ok für jetzt)
function makeId(type: "auftrag" | "projekt") {
  return `${type === "auftrag" ? "A" : "P"}-${crypto.randomUUID().slice(0, 8)}`
}

function makeCode(type: "auftrag" | "projekt", customerName: string, orderDate: string) {
  // A-MEIER-230125
  const d = new Date(orderDate)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)

  const clean = customerName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12)

  return `${type === "auftrag" ? "A" : "P"}-${clean}-${dd}${mm}${yy}`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string }
    const text = body.text?.trim()
    if (!text) {
      return NextResponse.json({ error: "Kein WhatsApp-Text übergeben." }, { status: 400 })
    }

    const parsed = parseWhatsAppMessage(text)
    const { missing } = validateParsed(parsed)

    // Minimal-Fallbacks, damit wir auch unvollständig anlegen können (WARN)
    const type = parsed.type ?? "auftrag"
    const customerName = parsed.customer_name ?? "Unbekannt"
    const orderDate = parsed.order_date ?? new Date().toISOString().slice(0, 10)
    const address = parsed.address ?? "—"

    const id = makeId(type)
    const code = (parsed.code?.trim() && parsed.code) || makeCode(type, customerName, orderDate)

    // reuse: gleiche Felder wie dein /api/add-item
    const createdAt = nowIso()

    // TODO: hier rufst du deine bestehende DB-insert Logik auf
    // Wenn du schon /api/add-item hast, kannst du auch dessen Insert-Funktion extrahieren.
    const { createItemFromApi } = await import("@/lib/server/createItemFromApi")

    await createItemFromApi({
      id,
      type,
      customerName,
      address,
      orderDate,
      code,
      billingAddress: parsed.billing_address ?? "",
      contactName: parsed.contact_name ?? "",
      missing, // speichern wir optional in Zukunft, erstmal nur fürs UI/debug
      createdAt,
      updatedAt: createdAt,
    })

    return NextResponse.json({ id, missing })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Fehler beim WhatsApp-Import." }, { status: 500 })
  }
}
