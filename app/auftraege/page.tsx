// app/auftraege/page.tsx
import { MainTopbar } from "@/components/MainTopbar"
import { getAuftraege, getFilesOfItem } from "@/lib/db/queries"
import type { Item, File } from "@/lib/types"
import AuftraegeClient from "./AuftraegeClient.tsx"

export default async function AuftraegePage() {
  // 1. Aufträge aus der DB laden (schon sortiert)
  const jobs: Item[] = await getAuftraege()

  // 2. Alle Files zu diesen Aufträgen laden
  const filesByItem: Record<string, File[]> = {}

  await Promise.all(
    jobs.map(async (item) => {
      const files = await getFilesOfItem(item.id)
      filesByItem[item.id] = files
    })
  )

  // 3. Layout-Wrapper + Übergabe an Client-Komponente
  return (
    <main className="min-h-screen bg-[#262626] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-2 px-6 py-6">
        <MainTopbar />
        <AuftraegeClient jobs={jobs} filesByItem={filesByItem} />
      </div>
    </main>
  )
}
