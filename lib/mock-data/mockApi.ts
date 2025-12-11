// lib/mockApi.ts
import type { Item, File, LogEntry } from "@/lib/types"

// unsere gemeinsamen Mock-Daten aus db/mockData.ts
import { items, files, logs } from "@/db/mockData"

// ------------------------------------------------------
// API-Funktionen (wie vorher, nur mit den neuen Namen)
// ------------------------------------------------------

export function fetchItems(): Item[] {
  return items
}

export function fetchItem(id: string): Item | undefined {
  return items.find((i) => i.id === id)
}

export function fetchFilesOfItem(itemId: string): File[] {
  return files.filter((f) => f.item_id === itemId)
}

export function fetchLogsOfItem(itemId: string): LogEntry[] {
  return logs.filter((l) => l.item_id === itemId)
}



