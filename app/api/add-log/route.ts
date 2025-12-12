// app/api/add-log/route.ts
import { NextResponse, NextRequest } from "next/server"
import { db } from "@/db/client"
import { logs } from "@/db/schema"

// kleine Hilfsfunktion für eine Log-ID
function createLogId() {
  return `L-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemId, text } = body as { itemId?: string; text?: string }

    if (!itemId || !text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "itemId und text sind Pflicht." },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const id = createLogId()

    await db.insert(logs).values({
      id,
      itemId,
      text: text.trim(),
      time: now,
      source: "manual", // passt zu deinem LogEntry-Union-Typ
    })

    return NextResponse.json(
      {
        id,
        itemId,
        text: text.trim(),
        time: now,
        source: "manual",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Fehler in /api/add-log:", error)
    return NextResponse.json(
      { error: "Interner Fehler beim Log-Speichern." },
      { status: 500 }
    )
  }
}
