// app/auftraege/AuftraegeClient.tsx
"use client"

import { Fragment, useMemo, useState } from "react"
import Link from "next/link"
import { getDisplayCode } from "@/lib/codeHelpers"
import type { Item, File } from "@/lib/types"
import {
  DocumentIcon,
  DocumentTextIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline"

import {
  getInvoiceStateForItem,
  type InvoiceState,
} from "@/lib/invoiceStateStore"

import {
  getStatusWithInvoice,
  getStatusPillStyle,
  isBaseDataOkDetail,
} from "@/lib/statusHelpers"
import { hasFileOfKind } from "@/lib/fileHelpers"

// -----------------------------
// Props
// -----------------------------
type AuftraegeClientProps = {
  jobs: Item[]
  filesByItem: Record<string, File[]>
}

// ---------------------------------------
// Kleine UI-Komponente: Heute-Trenner
// ---------------------------------------
function TodaySeparator({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3 text-[0.7rem] font-body uppercase tracking-[0.2em] text-slate-300">
      <div className="h-px flex-1 bg-slate-600/60" />
      <span className="rounded-full border border-slate-600/80 bg-[#262626] px-4 py-1">
        Heute · {label}
      </span>
      <div className="h-px flex-1 bg-slate-600/60" />
    </div>
  )
}

// ---------------------------------------
// Haupt-Komponente (Client)
// ---------------------------------------
export default function AuftraegeClient({
  jobs,
  filesByItem,
}: AuftraegeClientProps) {
  const [query, setQuery] = useState("")

  // Dateien-Helper, jetzt aus filesByItem statt mockApi
  function getFilesForItem(itemId: string): File[] {
    return filesByItem[itemId] ?? []
  }

  function hasTicketFile(item: Item): boolean {
    const files = getFilesForItem(item.id)
    return files.some((f) => f.kind === "ticket")
  }

  function hasReportFile(item: Item): boolean {
    const files = getFilesForItem(item.id)
    return files.some((f) => f.kind === "report")
  }

  // Status-Helper: gleiche Logik wie Detail-Seite
  function buildStatusForItem(item: Item) {
    const files = getFilesForItem(item.id)

    const invoiceState: InvoiceState = getInvoiceStateForItem(item)

    const { trafficLight, text } = getStatusWithInvoice(
      item,
      files,
      invoiceState
    )

    const statusPillStyle = getStatusPillStyle(trafficLight)

    const baseOk = isBaseDataOkDetail(item, files)
    const hasReport = hasFileOfKind(files, "report")
    const hasInvoice =
      invoiceState === "invoice" || invoiceState === "paid"

    return {
      trafficLight,
      statusText: text,
      statusPillStyle,
      baseOk,
      hasReport,
      hasInvoice,
    }
  }

  // 🔍 Filter-Logik für Suche
  function matchesQuery(item: Item, q: string) {
    if (!q) return true
    const needle = q.toLowerCase()

    const haystacks = [
      item.code ?? "",
      item.customer_name ?? "",
      item.address ?? "",
      item.contact_name ?? "",
      item.order_date ?? "",
    ]

    return haystacks.some((h) => h.toLowerCase().includes(needle))
  }

  const filteredJobs = useMemo(
    () => jobs.filter((job) => matchesQuery(job, query)),
    [jobs, query]
  )

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

  const todayIso = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
  const todayLabel = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  let separatorInserted = false

  return (
    <>
      {/* Header: Aufträge-Pille + Uhrzeit/Datum + Search */}
      <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Aufträge-Pille */}
        <div className="rounded-[2.5rem] bg-[#705CD6] px-10 py-6">
          <h1 className="font-display text-4xl tracking-[0.12em] uppercase text-slate-900 md:text-5xl">
            Aufträge
          </h1>
        </div>

        {/* Rechts: Uhrzeit/Datum + Suche */}
        <div className="flex flex-1 flex-col gap-3 md:items-end">
          <div className="hidden text-right text-slate-100 md:block">
            <div className="text-4xl font-semibold leading-none md:text-5xl">
              {timeString}
            </div>
            <div className="mt-2 text-lg text-slate-200">
              {dateString}
            </div>
          </div>

          {/* 🔍 Suche aktiv */}
          <div className="mt-2 flex w-full items-center gap-2 rounded-full bg-[#e5ddcf] px-4 py-2 text-xs font-body uppercase tracking-[0.2em] text-slate-900 md:max-w-xs md:self-end">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche nach ID, Kunde, Adresse…"
              className="flex-1 bg-transparent text-[0.7rem] uppercase tracking-[0.18em] text-slate-900 placeholder:opacity-60 focus:outline-none"
            />
            <span className="text-lg">🔍</span>
          </div>
        </div>
      </header>

      {/* Tabellen-Header */}
      <div className="mt-4 rounded-full bg-[#e5ddcf] px-8 py-4 text-[0.8rem] font-body uppercase tracking-[0.25em] text-slate-900">
        <div className="flex items-center justify-between gap-4">
          <span className="w-[180px]">ID</span>
          <span className="flex-1">Kunde</span>
          <span className="hidden flex-[1.4] md:block">Adresse</span>
          <span className="hidden w-[120px] text-center lg:block">
            Dateien
          </span>
          <span className="hidden w-[120px] text-center md:block">
            Status
          </span>
          <span className="w-[40px]" />
        </div>
      </div>

      {/* Rows + Heute-Trenner */}
      <div className="mt-2 flex flex-col gap-2">
        {filteredJobs.length === 0 && (
          <div className="mt-4 rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-300">
            Keine Aufträge gefunden.
          </div>
        )}

        {filteredJobs.map((item, index) => {
          const displayCode = getDisplayCode(item, filteredJobs)
          const hasTicket = hasTicketFile(item)
          const hasReport = hasReportFile(item)

          const { statusPillStyle } = buildStatusForItem(item)

          const rowBg = "#705CD6"

          // --- Timeline-Logik (jetzt basierend auf gefilterter Liste) ---
          const isBeforeToday = item.order_date < todayIso
          const prevOrderDate =
            index > 0 ? filteredJobs[index - 1].order_date : null
          const prevIsBeforeToday =
            prevOrderDate !== null ? prevOrderDate < todayIso : false

          const shouldInsertSeparator =
            !separatorInserted && isBeforeToday && !prevIsBeforeToday

          if (shouldInsertSeparator) {
            separatorInserted = true
          }
          // -----------------------

          return (
            <Fragment key={item.id}>
              {shouldInsertSeparator && (
                <TodaySeparator label={todayLabel} />
              )}

              <div
                className="rounded-full px-8 py-4 text-base text-slate-900"
                style={{ backgroundColor: rowBg }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* ID / Code */}
                  <div className="w-[180px] text-[0.7rem] font-semibold leading-tight">
                    {displayCode}
                  </div>

                  {/* Kunde + AP */}
                  <div className="flex-1 flex flex-col justify-center leading-tight">
                    <div className="leading-snug">
                      {item.customer_name}
                    </div>

                    {item.contact_name && (
                      <div className="text-[0.65rem] text-slate-100/70 leading-none">
                        {item.contact_name}
                      </div>
                    )}
                  </div>

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

                  {/* Status-Pille (ab md), mit gleicher Farb-Logik wie Detail */}
                  <div className="hidden w-[120px] items-center justify-center md:flex">
                    <span
                      className="inline-flex h-7 w-full max-w-[120px] rounded-full"
                      style={statusPillStyle}
                    />
                  </div>

                  {/* Ordner-Button (Detail) */}
                  <div className="flex w-[40px] items-center justify-end">
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
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
