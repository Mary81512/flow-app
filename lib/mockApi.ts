import { Item, File, LogEntry } from "./types"

// ---------------------------------------------
// Fake-Daten — exakt wie später aus dem Backend
// ---------------------------------------------

export const mockItems: Item[] = [
    {
        id: "a1",
        code: "A-REITZ-041125",
        type: "auftrag",
        customer_name: "Marcel",
        address: "Müllerstraße 8, 51069 Remscheid",
        created_at: "2025-11-25T08:10:00Z",
        updated_at: "2025-11-25T10:00:00Z",
        status: {
            data_complete: true,
            report_generated: false,
            invoice_written: true,
        },
    },
    {
        id: "b2",
        code: "P-BASF-041125-002",
        type: "projekt",
        customer_name: "BASF Werk",
        address: "Werkstraße 12, Köln",
        created_at: "2025-11-25T08:55:00Z",
        updated_at: "2025-11-25T10:00:00Z",
        status: {
            data_complete: true,
            report_generated: true,
            invoice_written: false,
        },
    },
    {
        id: "c3",
        code: "A-REITZ-101125",
        type: "auftrag",
        customer_name: "REITZ",
        address: "Strünkerstraße 4, Köln",
        created_at: "2025-11-25T08:50:00Z",
        updated_at: "2025-11-25T10:00:00Z",
        status: {
            data_complete: false,
            report_generated: true,
            invoice_written: true,
        },
    },
    {
        id: "d4",
        code: "P-NIKE-151125-002",
        type: "projekt",
        customer_name: "NIKE",
        address: "Steigstraße8, Köln",
        created_at: "2025-11-25T10:20:00Z",
        updated_at: "2025-11-25T10:00:00Z",
        status: {
            data_complete: false,
            report_generated: false,
            invoice_written: false,
        },
    },
]

// ---------------------------------------------
// Fake-Dateien
// ---------------------------------------------

export const mockFiles: File[] = [
    {
        id: "f1",
        item_id: "a1",
        kind: "ticket",
        filename: "auftragszettel.pdf",
        url: "/mock/auftragszettel.pdf",
        size_bytes: 12233,
        created_at: "2025-11-25T08:00:00Z",
    },
    {
        id: "f2",
        item_id: "d4",
        kind: "report",
        filename: "bericht.pdf",
        url: "/mock/bericht.pdf",
        size_bytes: 84555,
        created_at: "2025-11-25T08:00:00Z",
    },
    {
        id: "f3",
        item_id: "c3",
        kind: "report",
        filename: "bericht.pdf",
        url: "/mock/bericht.pdf",
        size_bytes: 84555,
        created_at: "2025-11-25T08:00:00Z",
    },
    {
        id: "f4",
        item_id: "b2",
        kind: "report",
        filename: "bericht.pdf",
        url: "/mock/bericht.pdf",
        size_bytes: 84555,
        created_at: "2025-11-25T08:00:00Z",
    },
]

// ---------------------------------------------
// Fake-Logbuch
// ---------------------------------------------

export const mockLogs: LogEntry[] = [
    {
        id: "l1",
        item_id: "a1",
        time: "2025-11-25T10:15:00Z",
        text: "Keller abgesaugt",
        source: "manual",
    },
    {
        id: "l2",
        item_id: "a1",
        time: "2025-11-25T09:30:00Z",
        text: "Kamera-Inspektion durchgeführt",
        source: "manual",
    },
]

// ---------------------------------------------
// Fake-API-Funktionen
// ---------------------------------------------

export function fetchItems(): Item[] {
    return mockItems
}

export function fetchItem(id: string): Item | undefined {
    return mockItems.find((i) => i.id === id)
}

export function fetchFilesOfItem(id: string): File[] {
    return mockFiles.filter((f) => f.item_id === id)
}

export function fetchLogsOfItem(id: string): LogEntry[] {
    return mockLogs.filter((l) => l.item_id === id)
}
