// app/api/add-file/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/client"
import { files } from "@/db/schema"
import type { FileKind } from "@/lib/types"
import { items } from "@/db/schema"
import { eq } from "drizzle-orm"


function createFileId() {
  return `F-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemId, kind, filename } = body as {
      itemId?: string
      kind?: FileKind
      filename?: string
    }

    if (!itemId || !kind) {
      return NextResponse.json(
        { error: "itemId und kind sind Pflicht." },
        { status: 400 }
      )
    }

    const id = createFileId()
    const now = new Date().toISOString()

    // Platzhalter-URL (später echter Upload!)
    const url = `/files/${id}-${filename ?? "file"}`

    const existing = await db.select().from(items).where(eq(items.id, itemId)).limit(1)
    if (existing.length === 0) {
      return NextResponse.json({ error: "Item nicht gefunden." }, { status: 404 })
    }


    await db.insert(files).values({
      id,
      itemId,
      kind,
      filename: filename ?? `${id}.dat`,
      url,
      sizeBytes: 0,
      createdAt: now,
    })

    return NextResponse.json(
      {
        id,
        itemId,
        kind,
        filename,
        url,
        createdAt: now,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Fehler in /api/add-file:", error)
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    )
  }
}
