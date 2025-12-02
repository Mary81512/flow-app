// lib/codeHelpers.ts
import type { Item } from "./types"

// Code in Stamm + optional Suffix trennen
export function splitCode(code: string) {
  const parts = code.split("-")

  if (parts.length === 4) {
    return {
      stem: `${parts[0]}-${parts[1]}-${parts[2]}`,
      suffix: parts[3],
    }
  }

  return {
    stem: code,
    suffix: null as string | null,
  }
}

export function formatSuffix(n: number): string {
  return n.toString().padStart(2, "0")
}

// Anzeige-Code mit optionalem -01 / -02
export function getDisplayCode(item: Item, allItems: Item[]): string {
  const { stem } = splitCode(item.code)

  // alle Items mit gleichem Stamm finden
  const group = allItems.filter((i) => {
    const { stem: s } = splitCode(i.code)
    return s === stem
  })

  if (group.length === 1) {
    return stem
  }

  const sorted = group.slice().sort((a, b) => a.code.localeCompare(b.code))
  const index = sorted.indexOf(item)
  const safeIndex = index === -1 ? 0 : index
  const suffix = formatSuffix(safeIndex + 1)

  return `${stem}-${suffix}`
}
