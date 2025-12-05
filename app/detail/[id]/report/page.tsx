// app/detail/[id]/report/page.tsx
"use client"

import { use } from "react"
import Link from "next/link"
import { MainTopbar } from "@/components/MainTopbar"
import { fetchItem, fetchFilesOfItem } from "@/lib/mockApi"
import type { Item, File } from "@/lib/types"
import { filesOfKind } from "@/lib/fileHelpers"

import {
  ArrowDownTrayIcon,
  XMarkIcon,
  PlusIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"

// kleines Helferchen: Report-File rausfiltern
function getReportFile(files: File[]): File | undefined {
  return files.find((f) => f.kind === "report")
}

export default function ReportPage({
  params,
}: {
  // wie bei Ticket: params ist ein Promise
  params: Promise<{ id: string }>
}) {
  // Promise auspacken (Next 15 / React 19 Verhalten)
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
  const report = filesOfKind(files, "report")[0]

  return (
    <main className="min-h-screen bg-[#262626] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-6 py-6">
        <MainTopbar />

        {/* GROSSE KARTE – wie Ticket, aber ohne neue Shadows */}
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
                Baustellenbericht
              </h1>

              {/* Platzhalter, damit der Titel mittig wirkt */}
              <div className="h-10 w-10" />
            </div>

            {/* INHALT: Report-Kachel oder Hinweis */}
            {report ? (
              <div className="inline-flex flex-col gap-2 rounded-3xl bg-[#d1d5db] px-6 py-5 text-slate-900">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9ca3af]">
                    <DocumentTextIcon className="h-10 w-10" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-700">
                      Datei
                    </span>
                    <span className="text-sm font-semibold">
                      {report.filename}
                    </span>
                  </div>

                  <a
                    href={report.url ?? "#"}
                    className="ml-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-50 hover:bg-slate-800"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-black/30 px-6 py-5 text-sm text-slate-200">
                Für diesen Auftrag ist noch kein Baustellenbericht hinterlegt.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
