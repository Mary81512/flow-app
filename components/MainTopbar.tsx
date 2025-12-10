// components/MainTopbar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AddModal } from "./AddModal"

type Tab = {
  href: string
  label: string
  disabled?: boolean
}

const TABS: Tab[] = [
  { href: "/heute", label: "HEUTE" },
  { href: "/auftraege", label: "AUFTRÄGE" },
  { href: "/projekte", label: "PROJEKTE" },
  { href: "/kalender", label: "KALENDER", disabled: true }, // kommt später :)
]

export function MainTopbar() {
  const pathname = usePathname()
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
    <div className="flex items-center justify-between">
      {/* Plus-Button */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-500 bg-slate-900/60 text-xl leading-none"
      >
        +
      </button>

      {/* Tabs */}
      <nav className="flex gap-8 text-xs font-semibold uppercase tracking-[0.25em]">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href)

          if (tab.disabled) {
            // Kalender: noch nicht klickbar
            return (
              <span
                key={tab.href}
                className="text-slate-500 cursor-default"
              >
                {tab.label}
              </span>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                isActive ? "text-sky-400" : "text-slate-400 hover:text-sky-300"
              }
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* rechter Spacer, damit die Navi mittig bleibt */}
      <div className="h-8 w-8" />
    </div>
    <AddModal
    isOpen={isAddOpen}
    onClose={() => setIsAddOpen(false)}
    />
    </>
  )
}
