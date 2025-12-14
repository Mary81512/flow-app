import { db } from "@/db/client"
import { items } from "@/db/schema"

type Input = {
  id: string
  type: "auftrag" | "projekt"
  customerName: string
  address: string
  orderDate: string
  code: string
  billingAddress: string
  contactName: string
  createdAt: string
  updatedAt: string
  missing?: string[]
}

export async function createItemFromApi(input: Input) {
  // statusDataComplete = false, wenn Pflichtdaten fehlen
  const dataComplete = (input.missing?.length ?? 0) === 0

  await db.insert(items).values({
    id: input.id,
    type: input.type,
    code: input.code,
    customerName: input.customerName,
    address: input.address,
    orderDate: input.orderDate,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,

    // falls im schema vorhanden:
    billingAddress: input.billingAddress || null,
    contactName: input.contactName || null,

    statusDataComplete: dataComplete,
    statusReportGenerated: false,
    statusInvoiceWritten: false,
  })
}
