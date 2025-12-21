import Link from "next/link"
import { MainTopbar } from "@/components/MainTopbar"
import type { File, Item, FileKind } from "@/lib/types"
import { firstFileOfKind } from "@/lib/fileHelpers"

import {
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline"

type Props = {
  id: string
  item: Item
  files: File[]
  kind: FileKind
  title: string
  emptyText: string
}

export function FilePageShell({
  id,
  item,
  files,
  kind,
  title,
  emptyText,
}: Props) {
  const file = firstFileOfKind(files, kind)

  return (
    <main className="min-h-screen bg-[#262626] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-6 py-6">
        <MainTopbar />

        <section className="mt-6 flex-1">
          <div className="relative rounded-[3rem] bg-[#2f3238] px-10 py-8 ">
            <Link
              href={`/detail/${id}`}
              className="absolute right-8 top-8 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-400/60 bg-black/20 text-slate-100 hover:bg-black/40"
            >
              <XMarkIcon className="h-5 w-5" />
            </Link>

            <div className="mb-10 flex items-center justify-between">
              <div className="h-10 w-10" />
              <h1 className="font-display text-3xl uppercase tracking-[0.18em] text-slate-100 md:text-4xl">
                {title}
              </h1>
              <div className="h-10 w-10" />
            </div>

            {file ? (
              <div className="inline-flex flex-col gap-2 rounded-3xl bg-[#d1d5db] px-6 py-5 text-slate-900 ">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9ca3af]">
                    <DocumentIcon className="h-10 w-10" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-700">
                      Datei
                    </span>
                    <span className="text-sm font-semibold">
                      {file.filename}
                    </span>
                  </div>

                  <a
                    href={file.url ?? "#"}
                    className="ml-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-50 hover:bg-slate-800"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-black/30 px-6 py-5 text-sm text-slate-200">
                {emptyText}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
