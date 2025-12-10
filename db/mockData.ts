// db/mockData.ts
import type { Item, File, LogEntry } from "../lib/types"

// ------------------------------------------------------
// ITEMS
// ------------------------------------------------------

export const items: Item[] = [
  {
    id: "A1",
    type: "auftrag",
    code: "A-MARCEL-251125", // Auftragsdatum 25.11.25
    customer_name: "Marcel",
    address: "Müllerstraße 8, 51069 Remscheid",
    order_date: "2025-11-25",
    created_at: "2025-11-25T08:10:00",
    updated_at: "2025-11-25T10:00:00",
    status: {
      data_complete: true,
      report_generated: true,
      invoice_written: false,
    },
  },

  {
    id: "A2",
    type: "auftrag",
    code: "A-MEIER-230125", // 23.01.25
    customer_name: "Herr Meier",
    address: "Bergweg 12, 42103 Wuppertal",
    order_date: "2025-01-23",
    created_at: "2025-01-23T09:30:00",
    updated_at: "2025-01-23T10:15:00",
    status: {
      data_complete: true,
      report_generated: false,
      invoice_written: false,
    },
  },

  {
    id: "A3",
    type: "auftrag",
    code: "A-SCHMIDT-150225", // 15.02.25
    customer_name: "Frau Schmidt",
    address: "Waldstr. 55, 42853 Remscheid",
    order_date: "2025-02-15",
    created_at: "2025-02-15T11:20:00",
    updated_at: "2025-02-15T11:45:00",
    status: {
      data_complete: false,
      report_generated: false,
      invoice_written: false,
    },
  },

  {
    id: "P1",
    type: "projekt",
    code: "P-NIKE-010325", // 01.03.25
    customer_name: "Nike GmbH",
    address: "Sportallee 9, Köln",
    order_date: "2025-03-01",
    created_at: "2025-03-01T08:00:00",
    updated_at: "2025-03-05T16:30:00",
    status: {
      data_complete: true,
      report_generated: true,
      invoice_written: true,
    },
  },

  {
    id: "P2",
    type: "projekt",
    code: "P-ALBERN-100325", // 10.03.25
    customer_name: "Albern Bau",
    address: "Hauptstr. 44, Düsseldorf",
    order_date: "2025-03-10",
    created_at: "2025-03-10T09:00:00",
    updated_at: "2025-03-10T12:00:00",
    status: {
      data_complete: true,
      report_generated: false,
      invoice_written: false,
    },
  },

  {
    id: "P3",
    type: "projekt",
    code: "P-RHEIN-180225", // 18.02.25
    customer_name: "Hausverwaltung Rhein",
    address: "Am Wall 78, Köln",
    order_date: "2025-02-18",
    created_at: "2025-02-18T07:30:00",
    updated_at: "2025-02-19T15:10:00",
    status: {
      data_complete: true,
      report_generated: false,
      invoice_written: false,
    },
  },

  {
    id: "A4",
    type: "auftrag",
    code: "A-TESTKUNDE-010225", // 01.02.25
    customer_name: "Testkunde",
    address: "Testweg 1, Remscheid",
    order_date: "2025-02-01",
    created_at: "2025-02-01T08:30:00",
    updated_at: "2025-02-01T08:30:00",
    status: {
      data_complete: false,
      report_generated: false,
      invoice_written: false,
    },
  },

  {
    id: "P4",
    type: "projekt",
    code: "P-GIGABAU-200325", // 20.03.25
    customer_name: "Gigabau AG",
    address: "Industriestr. 99, Essen",
    order_date: "2025-03-20",
    created_at: "2025-03-20T09:00:00",
    updated_at: "2025-03-21T12:00:00",
    status: {
      data_complete: true,
      report_generated: true,
      invoice_written: false,
    },
  },
]

// ------------------------------------------------------
// FILES
// ------------------------------------------------------

export const files: File[] = [
  // A1
  {
    id: "F1",
    item_id: "A1",
    kind: "ticket",
    filename: "AUFTRAGSZETTEL-A1.pdf",
    url: "/files/A1-ticket.pdf",
    size_bytes: 120000,
    created_at: "2025-11-25T08:15:00",
  },
  {
    id: "F2",
    item_id: "A1",
    kind: "picture",
    filename: "IMG_A1_01.jpg",
    url: "/files/a1-img-01.jpg",
    size_bytes: 800000,
    created_at: "2025-11-25T09:00:00",
  },
  {
    id: "F3",
    item_id: "A1",
    kind: "report",
    filename: "Bericht_A1.pdf",
    url: "/files/A1-report.pdf",
    size_bytes: 250000,
    created_at: "2025-11-25T09:45:00",
  },

  // A2
  {
    id: "F4",
    item_id: "A2",
    kind: "ticket",
    filename: "AUFTRAGSZETTEL-A2.pdf",
    url: "/files/A2-ticket.pdf",
    size_bytes: 110000,
    created_at: "2025-01-23T09:40:00",
  },

  // P1 (Projekt mit mehreren Reports)
  {
    id: "F10",
    item_id: "P1",
    kind: "report",
    filename: "P1-Bericht-Tag1.pdf",
    url: "/files/p1-report-1.pdf",
    size_bytes: 300000,
    created_at: "2025-03-01T18:00:00",
  },
  {
    id: "F11",
    item_id: "P1",
    kind: "report",
    filename: "P1-Bericht-Tag2.pdf",
    url: "/files/p1-report-2.pdf",
    size_bytes: 320000,
    created_at: "2025-03-02T18:00:00",
  },
  {
    id: "F12",
    item_id: "P1",
    kind: "picture",
    filename: "P1-Bild-01.jpg",
    url: "/files/p1-pic-01.jpg",
    size_bytes: 850000,
    created_at: "2025-03-02T10:00:00",
  },
  {
    id: "F13",
    item_id: "P1",
    kind: "logdata",
    filename: "P1-logdata.json",
    url: "/files/p1-log.json",
    size_bytes: 50000,
    created_at: "2025-03-05T16:00:00",
  },

  // P2 – Bilder + Videos
  {
    id: "F20",
    item_id: "P2",
    kind: "picture",
    filename: "P2-Bild-01.jpg",
    url: "/files/p2-img1.jpg",
    size_bytes: 600000,
    created_at: "2025-03-10T10:00:00",
  },
  {
    id: "F21",
    item_id: "P2",
    kind: "video",
    filename: "P2-Video-01.mov",
    url: "/files/p2-video1.mov",
    size_bytes: 12000000,
    created_at: "2025-03-10T11:00:00",
  },

  // P3 nur Logdaten
  {
    id: "F30",
    item_id: "P3",
    kind: "logdata",
    filename: "P3-Log-1.json",
    url: "/files/p3-log1.json",
    size_bytes: 70000,
    created_at: "2025-02-18T07:40:00",
  },

  // P4 (Stresstest)
  ...Array.from({ length: 5 }).map<File>((_, i) => ({
    id: `P4-PIC-${i}`,
    item_id: "P4",
    kind: "picture",
    filename: `P4-Bild-${i}.jpg`,
    url: `/files/p4-bild-${i}.jpg`,
    size_bytes: 750000,
    created_at: `2025-03-20T0${i}:00:00`,
  })),
  ...Array.from({ length: 3 }).map<File>((_, i) => ({
    id: `P4-REP-${i}`,
    item_id: "P4",
    kind: "report",
    filename: `P4-Bericht-${i}.pdf`,
    url: `/files/p4-bericht-${i}.pdf`,
    size_bytes: 400000,
    created_at: `2025-03-21T1${i}:00:00`,
  })),
]

// ------------------------------------------------------
// LOGS
// ------------------------------------------------------

export const logs: LogEntry[] = [
  {
    id: "L1",
    item_id: "A1",
    text: "Keller abgesaugt",
    time: "2025-11-25T10:15:00",
    source: "manual",
  },
  {
    id: "L2",
    item_id: "A1",
    text: "Kamera-Inspektion durchgeführt",
    time: "2025-11-25T09:30:00",
    source: "system",
  },

  {
    id: "L10",
    item_id: "P1",
    text: "Team eingetroffen",
    time: "2025-03-05T08:00:00",
    source: "system",
  },
  {
    id: "L11",
    item_id: "P1",
    text: "Tag 1 abgeschlossen",
    time: "2025-03-05T16:00:00",
    source: "system",
  },

  {
    id: "L20",
    item_id: "P3",
    text: "Sanierung vorbereitet",
    time: "2025-02-18T10:15:00",
    source: "whatsapp",
  },
]
export const mockItems = items
export const mockFiles = files
export const mockLogs = logs

