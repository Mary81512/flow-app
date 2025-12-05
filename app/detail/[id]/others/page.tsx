// app/detail/[id]/andere/page.tsx
"use client"

import { use } from "react"
import Link from "next/link"
import { MainTopbar } from "@/components/MainTopbar"
import { fetchItem, fetchFilesOfItem } from "@/lib/mockApi"
import type { Item, File } from "@/lib/types"

import {
  XMarkIcon,
  PlusIcon,
  FolderIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline"

// Helfer: alle "other"-Dateien holen
function getOtherFiles(files: File[]): File[] {
  return files.filter((f) => f.kind === "other")
}

export default function AndereDateienPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const item: Item | undefined = fetchItem(id)

  // Wenn gar kein Auftrag/Projekt zu dieser ID existiert
  if (!item) {
    return (
      <main className="min-h-screen bg-[#262626] text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-6 py-6">
          <MainTopbar />

          <p className="mt-10 text-lg">
            Kein Auftrag / Projekt mit der ID <code>{id}</code> gefunden.
          </p>

          <Link
            href="/auftraege"
            className="mt-4 inline-flex text-sm text-sky-400 underline"
          >
            Zurück zur Auftragsliste
          </Link>
        </div>
      </main>
    )
  }

  const files = fetchFilesOfItem(item.id)
  const others = getOtherFiles(files)

  return (
    <main className="min-h-screen bg-[#262626] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-6 py-6">
        <MainTopbar />

        {/* GROSSE KARTE – ohne Shadow */}
        <section className="mt-6 flex-1">
          <div className="relative rounded-[3rem] bg-[#2f3238] px-10 py-8">
            {/* Close-Button oben rechts */}
            <Link
              href={`/detail/${item.id}`}
              className="absolute right-8 top-8 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-400/60 bg-black/20 text-slate-100 hover:bg-black/40"
            >
              <XMarkIcon className="h-5 w-5" />
            </Link>

            {/* Header: Titel + Add-Button links */}
            <div className="mb-10 flex items-center justify-between">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-400/60 bg-black/20 text-slate-100"
              >
                <PlusIcon className="h-5 w-5" />
              </button>

              <h1 className="font-display text-3xl uppercase tracking-[0.18em] text-slate-100 md:text-4xl">
                Andere Dateien
              </h1>

              {/* Platzhalter, damit der Titel mittig wirkt */}
              <div className="h-10 w-10" />
            </div>

            {/* INHALT: "Other"-Liste oder Hinweis */}
            {others.length === 0 ? (
              <div className="rounded-3xl bg-black/30 px-6 py-5 text-sm text-slate-200">
                Für diesen Auftrag sind noch keine anderen Dateien hinterlegt.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {others.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col gap-3 rounded-3xl bg-[#d1d5db] px-5 py-4 text-slate-900"
                  >
                    {/* Icon + Dateiname */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9ca3af]">
                        <FolderIcon className="h-9 w-9" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-700">
                          Datei
                        </span>
                        <span className="text-sm font-semibold truncate">
                          {file.filename}
                        </span>
                      </div>
                    </div>

                    {/* Download-Button */}
                    <div className="flex justify-end">
                      <a
                        href={file.url ?? "#"}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-50 hover:bg-slate-800"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
