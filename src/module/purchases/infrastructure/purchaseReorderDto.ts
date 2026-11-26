export interface ReorderLineFieldsDto {
  reorderSelectable?: boolean | null;
  previousUnitPrice?: number | null;
}

export interface ReorderOrderFieldsDto {
  canReorder?: boolean | null;
  reorderBlockReason?: string | null;
  reorderSourceRef?: { id: string; transactionNumber?: string | null } | null;
  reorderedOrders?: { id: string; transactionNumber?: string | null; status: string }[] | null;
  reorder?: {
    note?: string | null;
    sourceTotal?: number | null;
    priceIncreased?: boolean | null;
    totalIncreased?: boolean | null;
  } | null;
  approvalStage?: number | null;
}
