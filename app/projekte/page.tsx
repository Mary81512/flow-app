// app/projekte/page.tsx
import Link from "next/link"
import { getDisplayCode } from "@/lib/codeHelpers"
import { MainTopbar } from "@/components/MainTopbar"
import type { Item, File } from "@/lib/types"
import { fetchItems, fetchFilesOfItem } from "@/lib/mockApi"
import {
  DocumentIcon,
  DocumentTextIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline"

// ---------------------------------------
// 1) Nur PROJEKTE laden & sortieren
// ---------------------------------------
function getProjects(): Item[] {
  return fetchItems()
    .filter((item) => item.type === "projekt")
    .slice()
    .sort((a, b) => {
      const da = new Date(a.created_at.replace("Z", ""))
      const db = new Date(b.created_at.replace("Z", ""))
      return db.getTime() - da.getTime()
    })
}

// ---------------------------------------
// 3) Dateien & Status-Logik (wie Aufträge)
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

// Ampel-Logik wiederverwendet
function getListStatusForItem(
  item: Item | undefined
): { text: string; trafficLight: "red" | "yellow" | "green" } {
  if (!item) {
    return { text: "Kein Projekt", trafficLight: "red" }
  }

  // Basisdaten:
  // bei Projekten reicht: Basisdaten ok, Ticket ist optional
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

// Status-Pill-Farbe
function getStatusPillClasses(trafficLight: "red" | "yellow" | "green") {
  if (trafficLight === "red") return "bg-[#D46E6E]"
  if (trafficLight === "green") return "bg-[#6DCC62]"
  return "bg-[linear-gradient(135deg,#6DCC62_50%,#FFE14D_50%)]"
}

// ---------------------------------------
// 4) Page-Komponente
// ---------------------------------------
export default function ProjectsPage() {
  const projects = getProjects()

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
        {/* Topbar: Plus-Button + Tabs (Projekte aktiv) */}
        <MainTopbar />

        {/* Header: Projekte-Pille + Uhrzeit/Datum + Search */}
        <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* Projekte-Pille (blau) */}
          <div className="rounded-[2.5rem] bg-[#4A7EC2] px-10 py-6">
            <h1 className="font-display text-4xl tracking-[0.12em] uppercase text-slate-900 md:text-5xl">
              Projekte
            </h1>
          </div>

          {/* Rechts: Uhrzeit/Datum (nur ab md) + Suche */}
          <div className="flex flex-1 flex-col gap-3 md:items-end">
            {/* Uhrzeit + Datum nur ab md */}
            <div className="hidden text-right text-slate-100 md:block">
              <div className="text-4xl font-semibold leading-none md:text-5xl">
                {timeString}
              </div>
              <div className="mt-2 text-lg text-slate-200">{dateString}</div>
            </div>

            {/* Suchfeld: mobil volle Breite, ab md schmaler rechts */}
            <div className="mt-2 flex w-full items-center gap-2 rounded-full bg-[#e5ddcf] px-4 py-2 text-xs font-body uppercase tracking-[0.2em] text-slate-900 md:max-w-xs md:self-end">
              <span className="flex-1 opacity-60">Suche (später)</span>
              <span className="text-lg">🔍</span>
            </div>
          </div>
        </header>

        {/* Tabellen-Header */}
        <div className="mt-4 rounded-full bg-[#e5ddcf] px-8 py-4 text-[0.8rem] font-body uppercase tracking-[0.25em] text-slate-900">
          <div className="flex items-center justify-between gap-4">
            {/* ID */}
            <span className="w-[160px]">ID</span>
            {/* Kunde */}
            <span className="flex-1">Kunde</span>
            {/* Adresse (ab md) */}
            <span className="hidden flex-[1.4] md:block">Adresse</span>
            {/* Dateien (ab lg) */}
            <span className="hidden w-[120px] text-center lg:block">
              Dateien
            </span>
            {/* Status (ab md) */}
            <span className="hidden w-[120px] text-center md:block">
              Status
            </span>
            {/* Ordner-Spalte */}
            <span className="w-[40px]" />
          </div>
        </div>

        {/* Rows */}
        <div className="mt-2 flex flex-col gap-2">
          {projects.map((item) => {
            const displayCode = getDisplayCode(item, projects)
            const hasTicket = hasTicketFile(item)
            const hasReport = hasReportFile(item)
            const { trafficLight } = getListStatusForItem(item)
            const pillBackground = getStatusPillClasses(trafficLight)

            const rowBg = "#4A7EC2" // Projekte sind blau

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
                  <div className="hidden flex-[1.4] truncate md:block">
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

                  {/* Status-Pille (ab md) */}
                  <div className="hidden w-[120px] items-center justify-center md:flex">
                    <span
                      className={`inline-flex h-7 w-full max-w-[120px] rounded-full ${pillBackground}`}
                    />
                  </div>

                 {/* Ordner-Button (Detail) */}
                <div className="flex w-[40px] items-center justify-end">
                <Link
                    href={`/items/${item.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-slate-900 bg-slate-900/10 transition hover:bg-slate-900/30"
                >
                    <FolderOpenIcon className="h-5 w-5" />
                </Link>
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
