// components/AddModal.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type AddContext = "file" | "log"
export type AddKind =
  | "ticket"
  | "report"
  | "logdata"
  | "picture"
  | "video"
  | "other"

type AddModalProps = {
  isOpen: boolean
  onClose: () => void

  initialItemCode?: string
  initialContext?: AddContext

  // 🔥 neu: für echtes Speichern von Logs
  itemId?: string
}

export function AddModal({
  isOpen,
  onClose,
  initialItemCode,
  initialContext = "file",
  itemId,
}: AddModalProps) {
  const router = useRouter()

  const [activeContext, setActiveContext] = useState<AddContext>(
    initialContext
  )
  const [selectedKind, setSelectedKind] = useState<AddKind>("report")
  const [itemQuery, setItemQuery] = useState(initialItemCode ?? "")

  // 🔥 neu: Log-Text + Saving-State + Fehler
  const [logText, setLogText] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Kontext von außen übernehmen (Detail: "file" oder "log")
  useEffect(() => {
    setActiveContext(initialContext ?? "file")
  }, [initialContext])

  // Code von außen in die Suche übernehmen
  useEffect(() => {
    setItemQuery(initialItemCode ?? "")
  }, [initialItemCode])

  // ESC schließt das Modal – Hooks immer ausführen
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (!isOpen) return
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const kindButtons: { key: AddKind; label: string }[] = [
    { key: "ticket", label: "Auftragszettel" },
    { key: "report", label: "Baustellenbericht" },
    { key: "logdata", label: "Logdata" },
    { key: "picture", label: "Bilder" },
    { key: "video", label: "Videos" },
    { key: "other", label: "Andere Dateien" },
  ]

  const isFileMode = activeContext === "file"
  const headerText = isFileMode
    ? "Datei hinzufügen"
    : "Logbuch-Eintrag hinzufügen"

  // 🔥 Speichern-Handler
  async function handleSave() {
  setError(null)

  // LOG-MODUS (bereits fertig)
  if (!isFileMode) {
    if (!itemId) {
      setError("Kein Auftrag/Projekt ausgewählt.")
      return
    }
    if (!logText.trim()) {
      setError("Bitte einen Logbucheintrag eingeben.")
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch("/api/add-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, text: logText.trim() }),
      })

      if (!res.ok) throw new Error("Fehler beim Speichern.")

      setLogText("")
      onClose()
      router.refresh()
    } catch {
      setError("Speichern fehlgeschlagen.")
    } finally {
      setIsSaving(false)
    }

    return
  }

  // 🔥 DATEI-MODUS (neu)
  if (isFileMode) {
    if (!itemId) {
      setError("Kein Auftrag/Projekt ausgewählt.")
      return
    }

    try {
      setIsSaving(true)

      const res = await fetch("/api/add-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          kind: selectedKind,
          filename: `${(initialItemCode ?? itemId ?? "ITEM").replaceAll(" ", "_")}-${selectedKind}.pdf`,
        }),
      })

      if (!res.ok) throw new Error("Fehler beim Speichern der Datei.")

      onClose()
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Datei konnte nicht gespeichert werden.")
    } finally {
      setIsSaving(false)
    }
  }
}

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-3xl bg-[#2f3238] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg uppercase tracking-[0.2em] text-slate-100">
            {headerText}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-500 text-lg text-slate-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* 1. Auftrag / Projekt (ID) */}
          <div className="space-y-1 text-xs uppercase tracking-[0.16em] text-slate-300">
            <label className="block">Auftrag / Projekt</label>
            <input
              type="text"
              value={itemQuery}
              onChange={(e) => setItemQuery(e.target.value)}
              placeholder="ID, Kunde oder Adresse … (später Suche)"
              className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
            {initialItemCode && (
              <p className="text-[0.65rem] text-slate-400">
                Vorausgewählt: <code>{initialItemCode}</code>
              </p>
            )}
          </div>

          {/* 2. Toggle Datei / Logbuch */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveContext("file")}
              className={[
                "flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em]",
                isFileMode
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-700/70 text-slate-100",
              ].join(" ")}
            >
              Datei
            </button>
            <button
              type="button"
              onClick={() => setActiveContext("log")}
              className={[
                "flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em]",
                !isFileMode
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-700/70 text-slate-100",
              ].join(" ")}
            >
              Logbuch
            </button>
          </div>

          {/* 3a. Datei-Modus: Dateitypen */}
          {isFileMode && (
            <div className="space-y-2 text-xs uppercase tracking-[0.16em] text-slate-300">
              <label className="block">Dateityp</label>
              <div className="flex flex-wrap gap-2">
                {kindButtons.map((btn) => {
                  const isActive = selectedKind === btn.key
                  return (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setSelectedKind(btn.key)}
                      className={[
                        "rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em]",
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "bg-slate-700/60 text-slate-100",
                      ].join(" ")}
                    >
                      {btn.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-[0.65rem] text-slate-400">
                (Später: automatischer Dateiname z.B.{" "}
                <code>{initialItemCode ?? "A-KUNDE-010125"}-REPORT.pdf</code>)
              </p>
            </div>
          )}

          {/* 3b. Logbuch-Modus: Textarea */}
          {!isFileMode && (
            <div className="space-y-2 text-xs uppercase tracking-[0.16em] text-slate-300">
              <label className="block">Logbucheintrag</label>
              <textarea
                rows={4}
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                placeholder="z.B. 'Keller abgesaugt, Rohr gespült, Kamera-Inspektion ...'"
              />
              
            </div>
          )}

          {/* Fehleranzeige */}
          {error && (
            <p className="text-[0.7rem] text-red-400">{error}</p>
          )}

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.16em] text-slate-300"
              disabled={isSaving}
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-slate-100 px-5 py-2 text-xs uppercase tracking-[0.16em] text-slate-900 disabled:opacity-60"
            >
              {isSaving ? "Speichern …" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
