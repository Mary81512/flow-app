// app/detail/[id]/page.tsx
import { MainTopbar } from "@/components/MainTopbar"
import DetailClient from "./DetailClient.tsx"
import {
  getItemById,
  getFilesOfItem,
  getLogsOfItem,
} from "@/lib/db/queries"

export default async function DetailPage({
  params,
}: {
    params: Promise<{ id: string }>
  }) {
  
  const { id } = await params

  const item = await getItemById(id)

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

  const [files, logs] = await Promise.all([
    getFilesOfItem(item.id),
    getLogsOfItem(item.id),
  ])

  return <DetailClient item={item} files={files} logs={logs} />
}
