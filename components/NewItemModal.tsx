// components/NewItemModal.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type NewItemModalProps = {
  isOpen: boolean
  onClose: () => void
}

type ItemType = "auftrag" | "projekt"

export default function NewItemModal({
  isOpen,
  onClose,
}: NewItemModalProps) {
  const router = useRouter()

  const [type, setType] = useState<ItemType>("auftrag")
  const [customerName, setCustomerName] = useState("")
  const [address, setAddress] = useState("")
  const [orderDate, setOrderDate] = useState("") // YYYY-MM-DD
  const [code, setCode] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingAddress, setBillingAddress] = useState("")
  const [contactName, setContactName] = useState("")


  if (!isOpen) return null

  async function handleSave() {
    setError(null)
    setIsSaving(true)

    try {
      const res = await fetch("/api/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          customerName,
          address,
          orderDate,
          code,
          billingAddress,
          contactName,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Fehler beim Speichern.")
      }

      const data = (await res.json()) as { id: string }

      // nach Detailseite des neuen Auftrags springen
      onClose()
      router.push(`/detail/${data.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Auftrag/Projekt konnte nicht gespeichert werden.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-xl rounded-3xl bg-[#2f3238] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg uppercase tracking-[0.2em] text-slate-100">
            Neuer Auftrag / Neues Projekt
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-500 text-lg text-slate-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-xs uppercase tracking-[0.16em] text-slate-300">
          {/* Typ */}
          <div className="space-y-2">
            <label className="block">Typ</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("auftrag")}
                className={[
                  "flex-1 rounded-full px-4 py-2 text-xs",
                  type === "auftrag"
                    ? "bg-slate-100 text-slate-900"
                    : "bg-slate-700/70 text-slate-100",
                ].join(" ")}
              >
                Auftrag
              </button>
              <button
                type="button"
                onClick={() => setType("projekt")}
                className={[
                  "flex-1 rounded-full px-4 py-2 text-xs",
                  type === "projekt"
                    ? "bg-slate-100 text-slate-900"
                    : "bg-slate-700/70 text-slate-100",
                ].join(" ")}
              >
                Projekt
              </button>
            </div>
          </div>

          {/* Kunde */}
          <div className="space-y-1">
            <label className="block">Kunde (Rechnungskunde)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="z.B. Bau GmbH oder Frau Schmidt"
              className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

                   {/* Adresse (Auftragsadresse) */}
          <div className="space-y-1">
            <label className="block">Adresse (Auftragsadresse)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Straße, Hausnr., PLZ Ort"
              className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* 🆕 Rechnungsadresse */}
          <div className="space-y-1">
            <label className="block">Rechnungsadresse (optional)</label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="falls abweichend: Firma / Name, Straße, PLZ Ort"
              className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
            <p className="text-[0.65rem] text-slate-400 normal-case">
              Wenn leer, verwenden wir später einfach die Auftragsadresse als Rechnungsadresse.
            </p>
          </div>

          {/* 🆕 Ansprechpartner / Mieter */}
          <div className="space-y-1">
            <label className="block">Ansprechpartner / Mieter (optional)</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="z.B. Frau Schmidt (Mieterin)"
              className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>


          {/* Auftragsdatum */}
          <div className="space-y-1">
            <label className="block">Auftragsdatum / Projektstart</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100"
            />
            <p className="text-[0.65rem] text-slate-400 normal-case">
              Dieses Datum verwenden wir auch für deinen WhatsApp-Workflow.
            </p>
          </div>

          {/* Code (optional, sonst automatisch) */}
          <div className="space-y-1">
            <label className="block">Code (optional)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="z.B. A-MEIER-230125 – leer lassen für Auto-Code"
              className="w-full rounded-xl border border-slate-600 bg-[#1f2125] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Hinweis für "unvollständig ist ok" */}
          <p className="text-[0.65rem] text-slate-400 normal-case">
            Du kannst Felder auch erstmal leer lassen. Die Ampel steht dann auf
            WARN, bis alle Stammdaten da sind.
          </p>

          {error && (
            <p className="text-[0.7rem] text-red-400 normal-case">{error}</p>
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
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-slate-100 px-5 py-2 text-xs uppercase tracking-[0.16em] text-slate-900 disabled:opacity-60"
            >
              {isSaving ? "Speichere …" : "Anlegen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
