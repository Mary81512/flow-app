// ---------------------------------------------
// Zentraler Datentypen-Ort für dein komplettes Projekt
// ---------------------------------------------

export type ItemType = "auftrag" | "projekt"

export type ItemStatus = {
    data_complete: boolean // Pflichtdaten vollständig?
    report_generated: boolean // Baustellenbericht vorhanden?
    invoice_written: boolean // Rechnung geschrieben?
}

export type Item = {
    id: string
    code: string
    type: ItemType
    customer_name: string
    address: string

    created_at: string
    updated_at: string

    status: ItemStatus
}

// --------------------
// Dateien
// --------------------

export type FileKind =
    | "ticket"
    | "report"
    | "logdata"
    | "picture"
    | "video"
    | "other"

export type File = {
    id: string
    item_id: string
    kind: FileKind
    filename: string
    url: string
    size_bytes: number
    created_at: string
}

// --------------------
// Logbuch
// --------------------

export type LogSource = "manual" | "whatsapp" | "system"

export type LogEntry = {
    id: string
    item_id: string
    time: string
    text: string
    source: LogSource
}
