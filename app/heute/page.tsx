// app/page.tsx
import { fetchItems, fetchFilesOfItem } from "@/lib/mockApi"
import type { Item, File, FileKind } from "@/lib/types"

// -----------------------------
// Helper: Items sortieren (neueste zuerst)
// -----------------------------
function getSortedItems(): Item[] {
  return fetchItems()
    .slice()
    .sort((a, b) => {
      const da = new Date(a.created_at.replace("Z", ""))
      const db = new Date(b.created_at.replace("Z", ""))
      return db.getTime() - da.getTime()
    })
}

// -----------------------------
// Helper: Code mit -01 / -02-Suffix
// -----------------------------
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

  // alle Items mit gleichem Stamm
  const group = allItems.filter((i) => {
    const { stem: s } = splitCode(i.code)
    return s === stem
  })

  if (group.length === 1) {
    // nur eins → kein Suffix
    return stem
  }

  // mehrere → Suffixe nach Code-Reihenfolge
  const sorted = group.slice().sort((a, b) => a.code.localeCompare(b.code))
  const index = sorted.indexOf(item)
  const safeIndex = index === -1 ? 0 : index
  const suffix = formatSuffix(safeIndex + 1)

  return `${stem}-${suffix}`
}

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
// Helper: Dateien & Today-Status
// -----------------------------
function getFilesOfItem(item: Item): File[] {
  return fetchFilesOfItem(item.id)
}

function hasFileOfKind(item: Item, kind: FileKind): boolean {
  const files = getFilesOfItem(item)
  return files.some((f) => f.kind === kind)
}

// Grunddaten vorhanden?
function hasBaseData(item: Item): boolean {
  const hasCode = !!item.code && item.code.trim().length > 0
  const hasCustomer =
    !!item.customer_name && item.customer_name.trim().length > 0
  const hasAddress = !!item.address && item.address.trim().length > 0
  const hasDate = !!item.created_at // Platzhalter für Auftragsdatum

  return hasCode && hasCustomer && hasAddress && hasDate
}

// Today: OK oder WARN?
function isTodayOk(item: Item): boolean {
  const baseOk = hasBaseData(item)
  if (!baseOk) return false

  if (item.type === "auftrag") {
    // Aufträge brauchen Ticket
    return hasFileOfKind(item, "ticket")
  }

  // Projekte: Basisdaten reichen
  return true
}

// -----------------------------
// UI-Komponente
// -----------------------------
export default function TodayPage() {
  const items = getSortedItems()

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050510",
        color: "#f8fafc",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Today</h1>
        <p style={{ opacity: 0.7, fontSize: "0.95rem" }}>
          Neu eingegangene Aufträge & Projekte (Mock-Daten aus mockApi.ts)
        </p>
      </header>

      <section
        style={{
          borderRadius: "1rem",
          backgroundColor: "#0b0f1a",
          padding: "1rem 1.5rem",
          border: "1px solid #252b3b",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.8 }}>
              <th style={{ padding: "0.5rem" }}>Time</th>
              <th style={{ padding: "0.5rem" }}>Code</th>
              <th style={{ padding: "0.5rem" }}>Kunde</th>
              <th style={{ padding: "0.5rem" }}>Adresse</th>
              <th style={{ padding: "0.5rem", textAlign: "center" }}>Files</th>
              <th style={{ padding: "0.5rem", textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 4).map((item) => {
              const time = formatUploadTime(item)
              const displayCode = getDisplayCode(item, items)
              const hasTicket = hasFileOfKind(item, "ticket")
              const hasReport = hasFileOfKind(item, "report")
              const ok = isTodayOk(item)

              const rowBg =
                item.type === "auftrag" ? "#705CD6" : "#4A7EC2"

              return (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: rowBg,
                    color: "#020617",
                  }}
                >
                  <td style={{ padding: "0.5rem 0.75rem" }}>{time}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>
                    {displayCode}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    {item.customer_name}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{item.address}</td>
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* Ticket & Report als Emojis – später Icons */}
                    <span
                      style={{
                        opacity: hasTicket ? 1 : 0.25,
                        marginRight: "0.25rem",
                      }}
                    >
                      📄
                    </span>
                    <span style={{ opacity: hasReport ? 1 : 0.25 }}>📑</span>
                  </td>
                  <td
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {ok ? "OK" : "WARN"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </main>
  )
}


