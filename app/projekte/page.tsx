// app/projekte/page.tsx (SERVER-Komponente)

import { MainTopbar } from "@/components/MainTopbar"
import { getProjekte, getFilesOfItem } from "@/lib/db/queries"
import type { Item, File } from "@/lib/types"
import ProjekteClient from "./ProjekteClient.tsx"

export default async function ProjectsPage() {
  // Projekte aus der DB holen
  const projects: Item[] = await getProjekte()

  // Alle Dateien zu diesen Projekten holen und in ein Lookup packen
  const filesByItem: Record<string, File[]> = {}

  await Promise.all(
    projects.map(async (item) => {
      const files = await getFilesOfItem(item.id)
      filesByItem[item.id] = files
    })
  )

  return (
    <main className="min-h-screen bg-[#262626] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-2 px-6 py-6">
        <MainTopbar />
        <ProjekteClient projects={projects} filesByItem={filesByItem} />
      </div>
    </main>
  )
}
