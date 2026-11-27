export interface PriceChangeItemDto {
  purchaseOrderItem: string | { id: string; description?: string | null };
  description?: string | null;
  oldUnitPrice?: number | null;
  newUnitPrice: number;
}

export interface PriceChangeDto {
  id: string;
  status: string;
  purchaseOrder?: string | { id: string; transactionNumber?: string | null } | null;
  purchaseOrderRef?: {
    id: string;
    transactionNumber?: string | null;
    number?: string | null;
  } | null;
  reason?: string | null;
  vendorInvoiceNumber?: string | null;
  vendorInvoiceTotal?: number | null;
  items?: PriceChangeItemDto[] | null;
  approvalPlan?:
    | {
        name: string;
        mode: 'ANY' | 'ALL';
        roles: { role: string; name: string }[];
      }[]
    | null;
  approvals?:
    | { level: number; role: string; by: string; at: string; note?: string | null }[]
    | null;
  pendingApprovers?:
    | {
        level: number;
        name: string;
        mode: 'ANY' | 'ALL';
        roles: { id: string; name: string; approved: boolean }[];
      }[]
    | null;
  canDecide?: boolean | null;
  approvalStage?: number | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
}
