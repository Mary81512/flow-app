// app/api/add-file/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/client"
import { files } from "@/db/schema"
import type { FileKind } from "@/lib/types"
import { supabaseServerClient } from "@/lib/supabaseServer"

export const runtime = "nodejs" // wichtig für Buffer / Node-APIs

function createFileId() {
  return `F-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const itemId = formData.get("itemId")
    const kind = formData.get("kind")
    const file = formData.get("file") as File | null

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json(
        { error: "itemId ist Pflicht." },
        { status: 400 }
      )
    }

    if (!kind || typeof kind !== "string") {
      return NextResponse.json(
        { error: "kind ist Pflicht." },
        { status: 400 }
      )
    }

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Es wurde keine Datei mitgeschickt." },
        { status: 400 }
      )
    }

    const id = createFileId()
    const now = new Date().toISOString()

    const originalName = file.name || `${id}.dat`
    const path = `${itemId}/${id}-${originalName}`

    // Datei in Supabase Storage hochladen
    const supabase = supabaseServerClient()

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from("files") // Bucket-Name aus Schritt 1
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("❌ Upload-Fehler:", uploadError)
      return NextResponse.json(
        { error: "Upload nach Supabase Storage fehlgeschlagen." },
        { status: 500 }
      )
    }

    // für PUBLIC-Bucket: direkt Public URL holen
    const { data: publicData } = supabase.storage
      .from("files")
      .getPublicUrl(path)

    const url = publicData.publicUrl

    await db.insert(files).values({
      id,
      itemId,
      kind: kind as FileKind,
      filename: originalName,
      url,
      sizeBytes: file.size ?? 0,
      createdAt: now,
    })

    return NextResponse.json(
      {
        id,
        itemId,
        kind,
        filename: originalName,
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

