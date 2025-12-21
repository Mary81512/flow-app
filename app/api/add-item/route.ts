// app/api/add-item/route.ts
import { NextResponse } from "next/server"
import { createItemFromApi } from "@/lib/server/createItemFromApi"

export async function POST(req: Request) {
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

    const { id } = await createItemFromApi({
      type,
      customerName,
      address,
      orderDate,
      code,
      billingAddress,
      contactName,
    })

    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    console.error("❌ Fehler in /api/add-item:", error)
    return NextResponse.json(
      { error: "Auftrag/Projekt konnte nicht gespeichert werden." },
      { status: 500 }
    )
  }
}

