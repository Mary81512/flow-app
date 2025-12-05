// lib/fileHelpers.ts
import type { File, FileKind } from "./types"

// Alle Dateien eines bestimmten Typs
export function filesOfKind(files: File[], kind: FileKind): File[] {
  return files.filter((f) => f.kind === kind)
}

// Erste Datei eines Typs (z.B. ein Ticket)
export function firstFileOfKind(
  files: File[],
  kind: FileKind
): File | undefined {
  return files.find((f) => f.kind === kind)
}

// Nur ja/nein: gibt es mindestens eine Datei dieses Typs?
export function hasFileOfKind(files: File[], kind: FileKind): boolean {
  return files.some((f) => f.kind === kind)
}
