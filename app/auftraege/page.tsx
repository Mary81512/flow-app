// app/auftraege/page.tsx
import type { Item, File } from "@/lib/types"
import { fetchItems, fetchFilesOfItem } from "@/lib/mockApi"
import {
  DocumentIcon,
  DocumentTextIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline"

// ---------------------------------------
// 1) Nur AUFTRÄGE laden & sortieren
// ---------------------------------------
function getJobs(): Item[] {
  return fetchItems()
    .filter((item) => item.type === "auftrag")
    .slice()
    .sort((a, b) => {
      const da = new Date(a.created_at.replace("Z", ""))
      const db = new Date(b.created_at.replace("Z", ""))
      return db.getTime() - da.getTime()
    })
}

// ---------------------------------------
// 2) Code-Anzeige wie auf Today (…-01 / …-02)
// ---------------------------------------
function splitCode(code: string) {
  const parts = code.split("-")

  if (parts.length === 4) {
    return {
      stem: `${parts[0]}-${parts[1]}-${parts[2]}`,
      suffix: parts[3],
    }
  }

  return {
    stem: code,
    suffix: null as string | null,
  }
}

function formatSuffix(n: number): string {
  return n.toString().padStart(2, "0")
}

function getDisplayCode(item: Item, allItems: Item[]): string {
  const { stem } = splitCode(item.code)

  const group = allItems.filter((i) => {
    const { stem: s } = splitCode(i.code)
    return s === stem
  })

  if (group.length === 1) return stem

  const sorted = group.slice().sort((a, b) => a.code.localeCompare(b.code))
  const index = sorted.indexOf(item)
  const safeIndex = index === -1 ? 0 : index
  const suffix = formatSuffix(safeIndex + 1)

  return `${stem}-${suffix}`
}

// ---------------------------------------
// 3) Dateien & Status-Logik (aus Framer-Override)
// ---------------------------------------
function hasTicketFile(item: Item): boolean {
  const files: File[] = fetchFilesOfItem(item.id)
  return files.some((f) => f.kind === "ticket")
}

function hasReportFile(item: Item): boolean {
  const files: File[] = fetchFilesOfItem(item.id)
  return files.some((f) => f.kind === "report")
}

// Basisdaten wie Today
function hasBaseData(item: Item): boolean {
  const hasCode = !!item.code && item.code.trim().length > 0
  const hasCustomer =
    !!item.customer_name && item.customer_name.trim().length > 0
  const hasAddress = !!item.address && item.address.trim().length > 0
  const hasDate = !!item.created_at && item.created_at.trim().length > 0

  return hasCode && hasCustomer && hasAddress && hasDate
}

// 1:1 deine Ampel-Logik in Textform
function getListStatusForItem(
  item: Item | undefined
): { text: string; trafficLight: "red" | "yellow" | "green" } {
  if (!item) {
    return { text: "Kein Auftrag", trafficLight: "red" }
  }

  // Basisdaten sind erst OK, wenn sie da sind UND (bei Aufträgen) Ticket existiert
  const baseOk =
    hasBaseData(item) &&
    (item.type === "projekt" || hasTicketFile(item))

  const isProjekt = item.type === "projekt"
  const isAuftrag = item.type === "auftrag"

  const reportOk = item.status.report_generated
  const invoiceDone = item.status.invoice_written

  const parts: string[] = []

  if (baseOk) {
    parts.push("Basisdaten vollständig")
  } else {
    parts.push("Basisdaten fehlen")
  }

  if (isProjekt) {
    parts.push(reportOk ? "Bericht vorhanden" : "Bericht fehlt")
  }

  parts.push(invoiceDone ? "Rechnung geschrieben" : "Rechnung fehlt")

  let traffic: "red" | "yellow" | "green" = "red"

  if (!baseOk) {
    traffic = "red"
  } else {
    if (isProjekt) {
      const allGood = baseOk && reportOk && invoiceDone
      traffic = allGood ? "green" : "yellow"
    } else if (isAuftrag) {
      const allGood = baseOk && invoiceDone
      traffic = allGood ? "green" : "yellow"
    } else {
      traffic = baseOk ? "yellow" : "red"
    }
  }

  return { text: parts.join(" · "), trafficLight: traffic }
}

// Status-Pill-Farbe aus trafficLight
function getStatusPillClasses(trafficLight: "red" | "yellow" | "green") {
  if (trafficLight === "red") return "bg-[#D46E6E]"
  if (trafficLight === "green") return "bg-[#6DCC62]"
  return "bg-[linear-gradient(135deg,#6DCC62_50%,#FFE14D_50%)]"
}

// ---------------------------------------
// 4) Page-Komponente
// ---------------------------------------
export default function JobsPage() {
  const jobs = getJobs()

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
        {/* Topbar: Plus-Button + Tabs (wie Today, nur anderer aktiver Tab) */}
        <div className="flex items-center justify-between">
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-500 bg-slate-900/60 text-xl leading-none shadow-[0_3px_0_0_rgba(0,0,0,0.7)]">
            +
          </button>

          <nav className="flex gap-8 text-xs font-semibold tracking-[0.25em] uppercase">
            <span className="text-slate-400">HEUTE</span>
            <span className="text-sky-400">AUFTRÄGE</span>
            <span className="text-slate-400">PROJEKTE</span>
            <span className="text-slate-500">KALENDER</span>
          </nav>

          <div className="h-8 w-8" />
        </div>

        {/* Header: Aufträge-Pille + Uhrzeit/Datum + (später Search) */}
        <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="rounded-[2.5rem] bg-[#705CD6] px-10 py-6 shadow-[0_10px_0_0_rgba(0,0,0,0.7)]">
            <h1 className="font-display text-4xl tracking-[0.12em] uppercase text-slate-900 md:text-5xl">
              Aufträge
            </h1>
          </div>

          <div className="flex flex-1 flex-col items-end gap-3">
            <div className="text-right text-slate-100">
              <div className="text-4xl font-semibold leading-none md:text-5xl">
                {timeString}
              </div>
              <div className="mt-2 text-lg text-slate-200">{dateString}</div>
            </div>

            {/* Platzhalter-Suchfeld, nur Optik */}
            <div className="mt-2 flex w-full max-w-xs items-center gap-2 rounded-full bg-[#e5ddcf] px-4 py-2 text-xs font-body uppercase tracking-[0.2em] text-slate-900 shadow-[0_6px_0_0_rgba(0,0,0,0.7)]">
              <span className="flex-1 opacity-60">Suche (später)</span>
              <span className="text-lg">🔍</span>
            </div>
          </div>
        </header>

        {/* Tabellen-Header wie Today, aber ohne Time-Spalte */}
        <div className="mt-4 rounded-full bg-[#e5ddcf] px-8 py-4 text-[0.8rem] font-body uppercase tracking-[0.25em] text-slate-900">
          <div className="flex items-center justify-between gap-4">
            {/* ID */}
            <span className="w-[160px]">ID</span>
            {/* Kunde */}
            <span className="flex-1">Kunde</span>
            {/* Adresse (ab md) */}
            <span className="hidden flex-[1.2] md:block">Adresse</span>
            {/* Dateien (ab lg) */}
            <span className="hidden w-[120px] text-center lg:block">
              Dateien
            </span>
            {/* Status */}
            <span className="w-[140px] text-center">Status</span>
            {/* Ordner-Spalte */}
            <span className="w-[48px]" />
          </div>
        </div>

        {/* Rows */}
        <div className="mt-2 flex flex-col gap-2">
          {jobs.map((item) => {
            const displayCode = getDisplayCode(item, jobs)
            const hasTicket = hasTicketFile(item)
            const hasReport = hasReportFile(item)
            const { trafficLight } = getListStatusForItem(item)
            const pillClasses = getStatusPillClasses(trafficLight)

            const rowBg = "#705CD6" // Jobs sind immer Aufträge

            return (
              <div
                key={item.id}
                className="rounded-full px-8 py-4 text-base text-slate-900"
                style={{ backgroundColor: rowBg }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* ID / Code */}
                  <div className="w-[160px] font-semibold">
                    {displayCode}
                  </div>

                  {/* Kunde */}
                  <div className="flex-1">{item.customer_name}</div>

                  {/* Adresse (ab md) */}
                  <div className="hidden flex-[1.2] truncate md:block">
                    {item.address}
                  </div>

                  {/* Dateien (Ticket + Report, ab lg) */}
                  <div className="hidden w-[120px] items-center justify-center gap-2 lg:flex">
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

                  {/* Status-Pille (Ampel) */}
                  <div className="w-[140px] text-center">
                    <span
                      className={`inline-flex h-9 w-full max-w-[140px] items-center justify-center rounded-full border-2 border-slate-900 ${pillClasses}`}
                    />
                  </div>

                  {/* Ordner-Button (Detail) */}
                  <div className="flex w-[48px] items-center justify-end">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-slate-900 bg-slate-900/10 transition hover:bg-slate-900/30"
                      // TODO: später Navigation zur Detail-Seite
                    >
                      <FolderOpenIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
