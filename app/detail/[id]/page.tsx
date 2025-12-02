// app/detail/[id]/page.tsx
"use client"
import { use } from "react"   
import { useState } from "react"
import { MainTopbar } from "@/components/MainTopbar"
import {
  fetchItem,
  fetchFilesOfItem,
  fetchLogsOfItem,
} from "@/lib/mockApi"
import type { Item, File, LogEntry, FileKind } from "@/lib/types"

import {
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  FolderIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

type InvoiceState = "none" | "invoice" | "paid"

// -----------------------------
// Helper: Daten + Files + Logs
// -----------------------------

function formatDateTime(iso: string): string {
  const date = new Date(iso.replace("Z", ""))
  const d = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const t = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${d} · ${t}`
}

function hasFileOfKind(files: File[], kind: FileKind): boolean {
  return files.some((f) => f.kind === kind)
}

function hasBaseData(item: Item): boolean {
  const hasCode = !!item.code && item.code.trim().length > 0
  const hasCustomer =
    !!item.customer_name && item.customer_name.trim().length > 0
  const hasAddress = !!item.address && item.address.trim().length > 0
  const hasDate = !!item.created_at && item.created_at.trim().length > 0

  return hasCode && hasCustomer && hasAddress && hasDate
}

// Today-Logik nachgebaut: Basis + Ticket bei Aufträgen
function isBaseDataOkDetail(item: Item, files: File[]): boolean {
  if (!hasBaseData(item)) return false
  if (item.type === "auftrag") {
    return hasFileOfKind(files, "ticket")
  }
  return true
}

// Status + Ampel abhängig von Invoice-Toggle
function getStatusWithInvoice(
  item: Item,
  files: File[],
  invoiceState: InvoiceState
): { text: string; trafficLight: "red" | "yellow" | "green" } {
  const baseOk = isBaseDataOkDetail(item, files)
  const isProjekt = item.type === "projekt"
  const isAuftrag = item.type === "auftrag"

  const reportOk = hasFileOfKind(files, "report")
  const invoiceDone =
    invoiceState === "invoice" || invoiceState === "paid"

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

// Klasse für Status-Pille
function getStatusPillStyle(traffic: "red" | "yellow" | "green") {
  if (traffic === "red") {
    return { backgroundColor: "#D46E6E" }
  }
  if (traffic === "green") {
    return { backgroundColor: "#6DCC62" }
  }
  return {
    backgroundImage:
      "linear-gradient(135deg, #6DCC62 50%, #FFE14D 50%)",
  }
}

// -----------------------------
// Page-Komponente
// -----------------------------

export default function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 1. params-Promise auspacken
  const { id } = use(params)

  // 2. passendes Item aus der mockApi holen
  const item = fetchItem(id)

  // 3. Falls falsche URL oder keine Daten gefunden
  if (!item) {
    return (
      <main className="min-h-screen bg-[#262626] text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-6 py-6">
          <MainTopbar />
          <p className="mt-10 text-lg">
            Kein Auftrag / Projekt mit der ID <code>{id}</code>{" "}
            gefunden.
          </p>
        </div>
      </main>
    )
  }

  // AB HIER ist item garantiert vorhanden (nicht undefined)
  const files = fetchFilesOfItem(item.id)
  const logs = fetchLogsOfItem(item.id)

  const [invoiceState, setInvoiceState] = useState<InvoiceState>("none")

  const { trafficLight, text: statusText } = getStatusWithInvoice(
    item,
    files,
    invoiceState
  )

  const statusPillStyle = getStatusPillStyle(trafficLight)
  const baseOk = isBaseDataOkDetail(item, files)
  const hasReport = hasFileOfKind(files, "report")
  const hasInvoice =
    invoiceState === "invoice" || invoiceState === "paid"

  const created = formatDateTime(item.created_at)
  const updated = formatDateTime(item.updated_at)

  const isAuftrag = item.type === "auftrag"
  const typeLabel = isAuftrag ? "AUFTRAG" : "PROJEKT"
  const typeColor = isAuftrag ? "#705CD6" : "#4A7EC2"

  function cycleInvoiceState(prev: InvoiceState): InvoiceState {
    if (prev === "none") return "invoice"
    if (prev === "invoice") return "paid"
    return "none"
  }

  return (
    <main className="min-h-screen bg-[#262626] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-6 py-6">
        <MainTopbar />

        {/* HEADER */}
        <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* links: Typ + Textblock */}
          <div className="flex flex-1 gap-6">
            {/* Typ-Tag (Quadrat) */}
            <div
              className="flex h-28 w-28 items-center justify-center rounded-3xl text-center font-display text-lg uppercase text-slate-900"
              style={{ backgroundColor: typeColor }}
            >
              {typeLabel}
            </div>

            {/* Code, Kunde, Adresse */}
            <div className="flex flex-col justify-center gap-1">
              <div className="font-display text-2xl tracking-[0.12em] uppercase">
                {item.code}
              </div>
              <div className="text-lg">{item.customer_name}</div>
              <div className="text-sm text-slate-200">
                {item.address}
              </div>
            </div>
          </div>

          {/* rechts: Invoice-Toggle + Timestamps + Status-Ampel */}
          <div className="flex flex-col items-end gap-4">
            {/* Invoice-Toggle + Zeiten */}
            <div className="flex flex-col items-end gap-2">
            {/* Label "Rechnung" über der Pille */}
            <span className="font-display text-base uppercase tracking-[0.18em] text-slate-50">
                Rechnung
            </span>

            {/* Toggle-Pille */}
            <button
                type="button"
                className="flex items-center justify-center rounded-2xl px-6 py-2 text-slate-900 shadow-[0_4px_0_rgba(0,0,0,0.35)]"
                style={{
                backgroundColor:
                    invoiceState === "none"
                    ? "#D46E6E" // rot
                    : invoiceState === "invoice"
                    ? "#FFE14D" // gelb
                    : "#6DCC62", // grün
                }}
                onClick={() => setInvoiceState((prev) => cycleInvoiceState(prev))}
            >
                {invoiceState === "none" && (
                <span className="text-xl leading-none">×</span>
                )}

                {invoiceState === "invoice" && (
                <span className="text-xl leading-none">✓</span>
                )}

                {invoiceState === "paid" && (
                <BanknotesIcon className="h-5 w-5" />
                )}
            </button>

            {/* Zeiten */}
            <div className="text-right text-[0.7rem] font-mono leading-tight text-slate-200">
                <div>Erstellt: {created}</div>
                <div>Update: {updated}</div>
            </div>
            </div>


            {/* Status-Ampel */}
            <div
              className="flex h-20 min-w-[220px] items-center justify-center rounded-3xl px-6 text-slate-900 shadow-[0_6px_0_rgba(0,0,0,0.45)]"
              style={statusPillStyle}
            >
              <div className="flex items-center gap-6">
                {/* Warn */}
                <ExclamationTriangleIcon
                  className={`h-7 w-7 ${
                    baseOk ? "opacity-20" : "opacity-100"
                  }`}
                />
                {/* OK */}
                <CheckCircleIcon
                  className={`h-7 w-7 ${
                    baseOk ? "opacity-100" : "opacity-20"
                  }`}
                />
                {/* Report */}
                <DocumentTextIcon
                  className={`h-7 w-7 ${
                    hasReport ? "opacity-100" : "opacity-20"
                  }`}
                />
                {/* Invoice */}
                <BanknotesIcon
                  className={`h-7 w-7 ${
                    hasInvoice ? "opacity-100" : "opacity-20"
                  }`}
                />
              </div>
            </div>

            {/* Status-Text (optional unter der Ampel) */}
            <p className="max-w-sm text-right text-xs text-slate-200">
              {statusText}
            </p>
          </div>
        </header>

        {/* CONTENT: Dateien + Logbuch */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Dateien-Card */}
          <div className="rounded-[2.5rem] bg-[#2f3238] px-8 py-6 shadow-[0_8px_0_rgba(0,0,0,0.45)]">
            <h2 className="mb-6 font-display text-2xl uppercase tracking-[0.18em] text-slate-50">
              Dateien
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {/* Auftragszettel */}
              <DetailFileTile
                active={hasFileOfKind(files, "ticket")}
                icon={<DocumentIcon className="h-12 w-12" />}
                label="Auftragszettel"
              />
              {/* Baustellenbericht */}
              <DetailFileTile
                active={hasFileOfKind(files, "report")}
                icon={<DocumentTextIcon className="h-12 w-12" />}
                label="Baustellenbericht"
              />
              {/* Logdata */}
              <DetailFileTile
                active={hasFileOfKind(files, "logdata")}
                icon={<FolderIcon className="h-12 w-12" />}
                label="Logdata"
              />
              {/* Bilder */}
              <DetailFileTile
                active={hasFileOfKind(files, "picture")}
                icon={<PhotoIcon className="h-12 w-12" />}
                label="Bilder"
              />
              {/* Videos */}
              <DetailFileTile
                active={hasFileOfKind(files, "video")}
                icon={<VideoCameraIcon className="h-12 w-12" />}
                label="Videos"
              />
              {/* Andere Dateien */}
              <DetailFileTile
                active={hasFileOfKind(files, "other")}
                icon={<FolderIcon className="h-12 w-12" />}
                label="Andere Dateien"
              />
            </div>
          </div>

          {/* Logbuch-Card */}
          <div className="rounded-[2.5rem] bg-[#2f3238] px-8 py-6 shadow-[0_8px_0_rgba(0,0,0,0.45)]">
            <h2 className="mb-6 font-display text-2xl uppercase tracking-[0.18em] text-slate-50">
              Logbuch
            </h2>

            <div className="space-y-3">
              {logs.length === 0 && (
                <div className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-300">
                  Noch keine Logeinträge.
                </div>
              )}

              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-100"
                >
                  <span>{log.text}</span>
                  <span className="ml-4 shrink-0 text-[0.7rem] font-mono text-slate-300">
                    {formatDateTime(log.time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER: Baustellenbericht erstellen */}
        <section className="mt-8">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-[#2f3238] px-8 py-6 text-xl font-display uppercase tracking-[0.18em] text-slate-50 shadow-[0_8px_0_rgba(0,0,0,0.45)] transition-transform hover:translate-y-[1px]"
          >
            <DocumentTextIcon className="h-10 w-10" />
            Baustellenbericht erstellen
          </button>
        </section>
      </div>
    </main>
  )
}

// -------------------------------------
// Kleine Hilfs-Komponente für Datei-Tile
// -------------------------------------

function DetailFileTile({
  active,
  icon,
  label,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-2 rounded-3xl px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] ${
        active
          ? "cursor-pointer text-slate-50"
          : "cursor-default text-slate-400 opacity-30"
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-center">{label}</span>
    </button>
  )
}
