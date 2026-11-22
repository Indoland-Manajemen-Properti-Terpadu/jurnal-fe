import type { OrderItemDto, PartyDto } from '@/module/purchases/infrastructure/purchaseDto';

export interface BillSourceLineDto {
  purchaseOrderItem: string;
  description?: string | null;
  open?: number | null;
  unitPrice: number;
  taxRate?: number | null;
  schedule?: OrderItemDto['schedule'];
}

/** A receipt or an order that is ready to be billed (`GET /purchase-bills/sources`). */
export interface BillSourceDto {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  kind?: 'GOODS' | 'SERVICE' | null;
  isService?: boolean | null;
  vendor: PartyDto;
  purchaseOrder?: { id: string; transactionNumber?: string | null } | null;
  termKey?: string | null;
  termName?: string | null;
  term?: {
    name?: string | null;
    description?: string | null;
    dueDays?: number | null;
    dueBasis?: string | null;
    hasDueTerm?: boolean | null;
    dueText?: string | null;
  } | null;
  dueDate?: string | null;
  isPriceIncludeTax?: boolean | null;
  lines?: BillSourceLineDto[] | null;
  orderLines?: BillSourceLineDto[] | null;
}
