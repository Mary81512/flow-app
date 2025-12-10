// components/AddModal.tsx
"use client"

import { useEffect, useState } from "react"

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
}

export function AddModal({
  isOpen,
  onClose,
  initialItemCode,
  initialContext = "file",
}: AddModalProps) {
  const [activeContext, setActiveContext] = useState<AddContext>(
    initialContext
  )
  const [selectedKind, setSelectedKind] = useState<AddKind>("report")
  const [itemQuery, setItemQuery] = useState(initialItemCode ?? "")

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
                className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                placeholder="z.B. 'Keller abgesaugt, Rohr gespült, Kamera-Inspektion ...'"
              />
              <p className="text-[0.65rem] text-slate-400">
                (Später: Zeitstempel + Quelle automatisch)
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.16em] text-slate-300"
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="rounded-full bg-slate-100 px-5 py-2 text-xs uppercase tracking-[0.16em] text-slate-900"
            >
              Speichern (Mock)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

