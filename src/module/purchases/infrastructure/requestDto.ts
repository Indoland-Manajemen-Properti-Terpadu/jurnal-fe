import type {
  ApprovalFieldsDto,
  AttachmentDto,
  DocumentDto,
  PartyDto,
  ProductDto,
} from '@/module/purchases/infrastructure/purchaseDto';

export interface UserInfoDto {
  id: string;
  name?: string | null;
  email?: string | null;
  title?: string | null;
}

export interface RequestItemDto {
  _id: string;
  product?: ProductDto | null;
  kind: 'GOODS' | 'SERVICE';
  description?: string | null;
  specification?: string | null;
  quantity: number;
  unit?: { id: string; name?: string | null } | null;
}

/** An FPPBJ as the list and the detail return it; the detail adds `verifiedByInfo`. */
export interface TermSnapshotDto {
  paymentTerm?: string | null;
  name?: string | null;
  advanceType?: 'none' | 'partial' | 'full' | null;
  billingSplit?: 'single' | 'milestone' | 'recurring' | null;
  hasDueTerm?: boolean | null;
  hasRetention?: boolean | null;
  advancePercent?: number | null;
  installments?: number | null;
  installmentPercents?: number[] | null;
  dueDays?: number | null;
  periods?: number | null;
  retentionPercent?: number | null;
  maintenanceMonths?: number | null;
}

export interface QuoteLineDto {
  requestItem: string;
  unitPrice: number;
  finalPrice?: number | null;
  specification?: string | null;
  tax?: { id: string; name?: string | null } | null;
}

export interface QuoteDto {
  _id: string;
  vendor: PartyDto;
  quotationNumber?: string | null;
  validUntil?: string | null;
  description?: string | null;
  attachments?: AttachmentDto[] | null;
  paymentTerm?: string | null;
  termSnapshot?: TermSnapshotDto | null;
  leadDays?: number | null;
  warranty?: string | null;
  withReceipt?: boolean | null;
  isPriceIncludeTax?: boolean | null;
  discountAmount?: number | null;
  shippingAmount?: number | null;
  lines?: QuoteLineDto[] | null;
  scores?: Partial<Record<'price' | 'spec' | 'delivery' | 'term', number | null>> | null;
}

export interface ProcurementDto {
  route?: 'BIDDING' | 'SINGLE' | null;
  status?: string | null;
  singleReason?: string | null;
  belowMinQuotesReason?: string | null;
  winner?: string | null;
  reason?: string | null;
  negotiationNote?: string | null;
  quotes?: QuoteDto[] | null;
}

export interface ProcurementViewDto {
  biddingNumber?: string | null;
  quotes?:
    | {
        id: string;
        complete?: boolean | null;
        subtotal?: number | null;
        discountAmount?: number | null;
        taxAmount?: number | null;
        shippingAmount?: number | null;
        total?: number | null;
        score?: number | null;
        vendorHistory?: { orders?: number | null; lastOrderDate?: string | null } | null;
      }[]
    | null;
  cheapestVendor?: string | null;
  estimatedValue?: number | null;
  minQuotes?: number | null;
  submitErrors?: string[] | null;
  scoreCriteria?:
    | { key: 'price' | 'spec' | 'delivery' | 'term'; label: string; weight: number }[]
    | null;
  approvalPreview?: { name: string; mode: 'ANY' | 'ALL'; roles: string[] }[] | null;
}

export interface OrderRefDto {
  id: string;
  transactionNumber: string;
  isService?: boolean | null;
  total?: number | null;
  status: string;
}

export interface PurchaseRequestDto extends DocumentDto, ApprovalFieldsDto {
  status: string;
  statusLabel?: string | null;
  requiredDate?: string | null;
  department?: { id: string; name: string } | null;
  deliveryWarehouse?: { id: string; code?: string | null; name?: string | null } | null;
  purpose?: string | null;
  iom?: {
    number?: string | null;
    date?: string | null;
    attachments?: AttachmentDto[] | null;
  } | null;
  requesterInfo?: UserInfoDto | null;
  verifiedByInfo?: UserInfoDto | null;
  returnedByInfo?: UserInfoDto | null;
  returnNote?: string | null;
  cancelReason?: string | null;
  items: RequestItemDto[];
  isOwner?: boolean | null;
  procurement?: ProcurementDto | null;
  procurementView?: ProcurementViewDto | null;
  purchaseOrderRefs?: OrderRefDto[] | null;
  readyForOrder?: boolean | null;
}
