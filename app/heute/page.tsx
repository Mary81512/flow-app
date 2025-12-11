// app/page.tsx
import Link from "next/link"
import { MainTopbar } from "@/components/MainTopbar"
import { getDisplayCode } from "@/lib/codeHelpers"
import { getItemsForOrderDate, getFilesOfItem } from "@/lib/db/queries"
import type { Item, File, FileKind } from "@/lib/types"
import {
  DocumentIcon,
  DocumentTextIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline"

// -----------------------------
// Helper: Uhrzeit hübsch anzeigen
// -----------------------------
function formatUploadTime(item: Item): string {
  const date = new Date(item.created_at.replace("Z", ""))
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// -----------------------------
// Grunddaten + Today-Status
// -----------------------------
function hasBaseData(item: Item): boolean {
  const hasCode = !!item.code && item.code.trim().length > 0
  const hasCustomer =
    !!item.customer_name && item.customer_name.trim().length > 0
  const hasAddress = !!item.address && item.address.trim().length > 0
  const hasDate = !!item.created_at // Platzhalter für Auftragsdatum

  return hasCode && hasCustomer && hasAddress && hasDate
}

function isTodayOk(
  item: Item,
  hasTicket: boolean,
  hasReport: boolean
): boolean {
  const baseOk = hasBaseData(item)
  if (!baseOk) return false

  if (item.type === "auftrag") {
    // Aufträge brauchen Ticket
    return hasTicket
  }

  // Projekte: Basisdaten reichen
  return true
}


// -----------------------------
// UI-Komponente (Server Component)
// -----------------------------
export default async function TodayPage() {
  // Heutiges Auftragsdatum als YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10)

  // ✅ Nur Items von heute, nach Upload-Zeit sortiert
  const items: Item[] = await getItemsForOrderDate(todayStr)

  // Alle Files zu diesen Items laden (parallel)
  const filesByItem = new Map<string, File[]>()

  await Promise.all(
    items.map(async (item) => {
      const files = await getFilesOfItem(item.id)
      filesByItem.set(item.id, files)
    })
  )

  // Helper: hat dieses Item eine Datei von Art X?
  function hasFileOfKind(itemId: string, kind: FileKind): boolean {
    const files = filesByItem.get(itemId) ?? []
    return files.some((f) => f.kind === kind)
  }

  const now = new Date()
  const timeString = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const dateString = now.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <main className="min-h-screen bg-[#262626] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-2 px-6 py-6">
        <MainTopbar />

        {/* Header */}
        <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Hallo Marcel!
            </h1>
          </div>

          <div className="text-right text-slate-100">
            <div className="text-4xl font-semibold leading-none md:text-5xl">
              {timeString}
            </div>
            <div className="mt-2 text-lg text-slate-200">{dateString}</div>
          </div>
        </header>

        {/* Tabellen-Header */}
        <div className="mt-2 rounded-full bg-[#e5ddcf] px-8 py-4 text-[0.8rem] font-body uppercase tracking-[0.25em] text-slate-900 ">
          <div className="flex items-center justify-between gap-4">
            <span className="hidden w-[70px] sm:block">Time</span>
            <span className="w-[140px]">ID</span>
            <span className="flex-1">Kunde</span>
            <span className="hidden flex-[1.2] md:block">Adresse</span>
            <span className="hidden w-[100px] text-center lg:block">
              Dateien
            </span>
            <span className="w-[80px] text-center">Daten</span>
            <span className="w-[48px]" />
          </div>
        </div>

        {/* Rows */}
        <div className="mt-2 flex flex-col gap-2">
          {items.map((item) => {
            const time = formatUploadTime(item)
            const displayCode = getDisplayCode(item, items)

            const hasTicket = hasFileOfKind(item.id, "ticket")
            const hasReport = hasFileOfKind(item.id, "report")
            const ok = isTodayOk(item, hasTicket, hasReport)

            const rowBg =
              item.type === "auftrag" ? "#705CD6" : "#4A7EC2"

            return (
              <div
                key={item.id}
                className="rounded-full px-8 py-4 text-base text-slate-900 "
                style={{ backgroundColor: rowBg }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Time */}
                  <div className="hidden w-[70px] font-mono text-xs sm:block">
                    {time}
                  </div>

                  {/* ID / Code */}
                  <div className="w-[140px] font-semibold">
                    {displayCode}
                  </div>

                  {/* Kunde */}
                  <div className="flex-1">{item.customer_name}</div>

                  {/* Adresse */}
                  <div className="hidden flex-[1.2] truncate md:block">
                    {item.address}
                  </div>

                  {/* Dateien */}
                  <div className="hidden w-[100px] items-center justify-center gap-2 lg:flex">
                    <DocumentIcon
                      className={`h-9 w-9 ${
                        hasTicket ? "opacity-100" : "opacity-30"
                      }`}
                    />
                    <DocumentTextIcon
                      className={`h-9 w-9 ${
                        hasReport ? "opacity-100" : "opacity-30"
                      }`}
                    />
                  </div>

                  {/* Daten-Status */}
                  <div className="w-[80px] text-center">
                    {ok ? (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 text-lg">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 text-lg">
                        !
                      </span>
                    )}
                  </div>

                  {/* Ordner-Button */}
                  <div className="flex w-[48px] items-center justify-end">
                    <Link href={`/detail/${item.id}`}>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-slate-900 bg-slate-900/10 transition hover:bg-slate-900/30"
                      >
                        <FolderOpenIcon className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}

          {items.length === 0 && (
            <div className="mt-4 rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-300">
              Heute gibt es noch keine Aufträge / Projekte.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
