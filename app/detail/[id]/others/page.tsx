import Link from "next/link"
import { MainTopbar } from "@/components/MainTopbar"
import { getItemById, getFilesOfItem } from "@/lib/db/queries"
import { FilePageShell } from "../_components/FilePageShell"

export default async function OthersPage({
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
            Kein Auftrag / Projekt mit der ID <code>{id}</code> gefunden.
          </p>
          <Link href="/auftraege" className="mt-4 inline-flex text-sm text-sky-400 underline">
            Zurück zur Auftragsliste
          </Link>
        </div>
      </main>
    )
  }

  const files = await getFilesOfItem(id)

  return (
    <FilePageShell
      id={id}
      item={item}
      files={files}
      kind="other"
      title="Andere Dateien"
      emptyText="Für diesen Auftrag sind noch keine anderen Dateien hinterlegt."
    />
  )
}
