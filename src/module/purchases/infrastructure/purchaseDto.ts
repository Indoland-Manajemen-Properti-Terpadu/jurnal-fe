import type { OrderRetentionDto } from '@/module/purchases/infrastructure/orderRetentionMapper';
import type { AdvanceStateDto } from '@/module/purchases/infrastructure/advanceStateDto';
import type { DocumentJournalDto } from '@/module/purchases/infrastructure/documentJournalMappers';
import type {
  GoodsReceiptDisplayStatus,
  OrderItemStatus,
} from '@/module/purchases/domain/purchaseDocuments';
/** Shapes of the purchasing API responses, as captured from the live service. */

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface ListDto<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ContactListDto<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages?: number; pages?: number };
}

export type IdOr<T> = string | T;

export interface PartyDto {
  id: string;
  displayName?: string | null;
  npwp?: string | null;
  mappingAccount?: { defaultPaymentTerm?: number | null } | null;
}

export interface ProductDto {
  id: string;
  name: string;
  sku?: string | null;
  unit?: { id?: string; name?: string | null } | null;
  inventoryInfo?: { isTracked?: boolean } | null;
}

export interface TaxDto {
  id: string;
  name: string;
  rate: number;
}

export interface PaymentMethodDto {
  id: string;
  name: string;
  adminFee?: number | null;
  defaultAccount?: { name?: string | null } | null;
}

export interface AttachmentDto {
  _id?: string;
  id?: string;
  /** Stored file name as the user uploaded it. */
  fileName?: string;
  /** Path under the API address, e.g. `uploads/1795241690857-f61abb15.pdf`. */
  filePath?: string;
  mimeType?: string;
  kind?: 'VENDOR_INVOICE' | 'TAX_INVOICE' | 'OTHER';
  kindLabel?: string;
}

export interface ApprovalPlanDto {
  name: string;
  mode: 'ANY' | 'ALL';
  roles: { role: string; name: string }[];
}

export interface ApprovalEntryDto {
  level: number;
  role: string;
  by: string;
  at: string;
}

export interface PendingApproverDto {
  level: number;
  name: string;
  mode: 'ANY' | 'ALL';
  roles: { id: string; name: string; approved: boolean }[];
}

export interface DocumentDto {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  memo?: string | null;
  createdBy: string;
  createdAt: string;
  attachments?: AttachmentDto[] | null;
}

export interface ApprovalFieldsDto {
  approvalPlan?: ApprovalPlanDto[] | null;
  approvals?: ApprovalEntryDto[] | null;
  pendingApprovers?: PendingApproverDto[] | null;
  canDecide?: boolean | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
}

export interface AmountsDto {
  subtotal: number;
  discountType?: 'percentage' | 'nominal' | null;
  discountValue?: number | null;
  discountAmount: number;
  taxAmount: number;
  total: number;
  withholdingType?: 'percentage' | 'nominal' | null;
  withholdingValue?: number | null;
  withholdingAmount: number;
  withholdingTaxCode?: string | null;
  finalAmount: number;
  isPriceIncludeTax?: boolean | null;
}

export interface LineDto {
  _id: string;
  product?: ProductDto | null;
  description?: string | null;
  quantity: number;
  unit?: { name?: string | null } | null;
  unitPrice: number;
  tax?: TaxDto | null;
  discountAmount: number;
  taxAmount: number;
  amount: number;
}

export interface OrderItemDto extends LineDto {
  requestItem: string;
  specification?: string | null;
  receivedQty: number;
  billedQty: number;
  status?: OrderItemStatus | null;
  statusLabel?: string | null;
  billOnly?: boolean | null;
  schedule?: {
    kind: 'FULL' | 'ADVANCE' | 'TERM' | 'PERIOD' | 'RETENTION';
    seq?: number | null;
    of?: number | null;
    periodFrom?: string | null;
    periodTo?: string | null;
  } | null;
}

export interface PurchaseOrderDto extends DocumentDto, AmountsDto {
  statusLabel?: string | null;
  documentLabel?: string | null;
  isService?: boolean | null;
  expectedDate?: string | null;
  vendor: PartyDto & { emails?: string[] | null };
  purchaseRequest: IdOr<{ id: string }>;
  purchaseRequestRef?: {
    id: string;
    transactionNumber?: string | null;
    purpose?: string | null;
  } | null;
  paymentTerm?: { name?: string | null } | null;
  warranty?: string | null;
  warehouse?: { id: string; name: string } | null;
  deliveryAddress?: string | null;
  status: string;
  withReceipt?: boolean | null;
  items: OrderItemDto[];
  advance?: {
    amount?: number | null;
    requested?: number | null;
    paid?: number | null;
    used?: number | null;
    available?: number | null;
  } | null;
  advanceState?: AdvanceStateDto | null;
  retention?: OrderRetentionDto | null;
  payableAmount?: number | null;
  billedAmount?: number | null;
  sentByEmail?: boolean | null;
  sentTo?: string | null;
  sentCc?: string[] | null;
  sentNote?: string | null;
}

export interface GoodsReceiptDto extends DocumentDto, ApprovalFieldsDto {
  journals?: DocumentJournalDto[] | null;
  kind?: 'GOODS' | 'SERVICE' | null;
  documentLabel?: string | null;
  statusLabel?: string | null;
  vendor: PartyDto;
  purchaseOrder: IdOr<{ id: string }>;
  purchaseOrderRef?: { id: string; transactionNumber?: string | null } | null;
  warehouse?: { id: string; name: string } | null;
  deliveryNote?: string | null;
  status: string;
  displayStatus?: GoodsReceiptDisplayStatus | null;
  amount?: number | null;
  billRefs?: { id: string; transactionNumber?: string | null; status?: string | null }[] | null;
  items: {
    _id: string;
    purchaseOrderItem: string;
    product?: ProductDto | null;
    description?: string | null;
    receivedQty: number;
    rejectedQty?: number | null;
    accrualAmount: number;
  }[];
  journalTransaction?: string | null;
}

export interface BillItemDto extends LineDto {
  purchaseOrderItem?: string | null;
  account?: { id: string; name?: string | null } | null;
  returnedQty?: number | null;
}

export interface CreditApplicationDto {
  _id?: string;
  id?: string;
  source: 'ADVANCE' | 'RETURN';
  sourceId?: string;
  advance?: IdOr<{ id: string; transactionNumber?: string }>;
  purchaseReturn?: IdOr<{ id: string; transactionNumber?: string }>;
  amount: number;
  appliedAt?: string;
  voided?: boolean;
}

export interface DocumentRefDto {
  id: string;
  transactionNumber?: string | null;
  status?: string | null;
}

export interface PurchaseBillDto extends DocumentDto, AmountsDto {
  journals?: DocumentJournalDto[] | null;
  source?: 'RECEIPT' | 'ORDER' | 'MANUAL' | null;
  noMatch?: boolean | null;
  kind?: 'BILL' | 'RETENTION_RELEASE' | null;
  retentionRelease?: { bastNumber?: string | null } | null;
  statusLabel?: string | null;
  displayStatus?: string | null;
  displayStatusLabel?: string | null;
  vendorInvoiceNumber?: string | null;
  taxInvoiceNumber?: string | null;
  vendorInvoiceTotal?: number | null;
  vendor: PartyDto;
  purchaseOrderRefs?: DocumentRefDto[] | null;
  goodsReceiptRefs?: DocumentRefDto[] | null;
  paymentRequestRefs?: DocumentRefDto[] | null;
  returnRefs?: DocumentRefDto[] | null;
  paymentTerm?: { name?: string | null } | null;
  dueDate?: string | null;
  status: string;
  items: BillItemDto[];
  tags?: string[] | null;
  paidAmount: number;
  returnedAmount: number;
  creditAppliedAmount: number;
  remainingAmount: number;
  heldAmount?: number | null;
  requestableAmount?: number | null;
  variances?: { type: 'PRICE' | 'TOTAL'; expected?: number; actual?: number }[] | null;
  creditApplications?: CreditApplicationDto[] | null;
  journalTransaction?: string | null;
  verifiedAt?: string | null;
}

export interface PaymentVoucherDto extends DocumentDto {
  journals?: DocumentJournalDto[] | null;
  statusLabel?: string | null;
  vendor: PartyDto;
  status: string;
  totalAmount: number;
  paymentMethod?: PaymentMethodDto | string | null;
  depositAccount?: string | null;
  adminFee?: number | null;
  referenceNumber?: string | null;
  journalTransaction?: string | null;
  paidAt?: string | null;
  voidReason?: string | null;
  itemRefs?:
    | {
        kind: 'DP' | 'SETTLEMENT';
        amount: number;
        paymentRequest: { id: string; transactionNumber?: string | null };
        bill?: {
          id: string;
          transactionNumber?: string | null;
          vendorInvoiceNumber?: string | null;
        } | null;
        purchaseOrder?: { id: string; transactionNumber?: string | null } | null;
      }[]
    | null;
}

export interface PaymentRequestDto extends DocumentDto, ApprovalFieldsDto {
  statusLabel?: string | null;
  kindLabel?: string | null;
  kind: 'DP' | 'SETTLEMENT';
  status: string;
  vendor?: PartyDto | null;
  isMultiVendor?: boolean | null;
  vendorTotals?:
    | {
        vendor: string;
        vendorName?: string | null;
        amount: number;
        billCount?: number | null;
        voucher?: { id: string; transactionNumber?: string | null; status?: string | null } | null;
      }[]
    | null;
  amount: number;
  dueDate?: string | null;
  advanceAccount?: string | null;
  advanceAppliedAmount?: number | null;
  cancelReason?: string | null;
  purchaseOrderRef?: {
    id: string;
    transactionNumber?: string | null;
    isService?: boolean | null;
    total?: number | null;
    status?: string | null;
  } | null;
  paymentVoucherRef?: {
    id: string;
    transactionNumber?: string | null;
    totalAmount?: number | null;
    status?: string | null;
    paidAt?: string | null;
  } | null;
  itemRefs?:
    | {
        amount: number;
        vendor?: string | null;
        voucher?: { id: string } | null;
        bill: {
          id: string;
          transactionNumber?: string | null;
          vendorInvoiceNumber?: string | null;
          dueDate?: string | null;
          finalAmount?: number | null;
          remainingAmount?: number | null;
          status?: string | null;
        };
      }[]
    | null;
}

export interface PurchaseReturnDto extends DocumentDto {
  statusLabel?: string | null;
  settlementLabel?: string | null;
  settlement?: string | null;
  warehouse?: { id: string; name: string } | null;
  billRef?: { id: string; transactionNumber?: string | null } | null;
  refundAmount?: number | null;
  vendor: PartyDto;
  bill: IdOr<{ id: string }>;
  reason: string;
  status: string;
  items: (LineDto & { billItem: string })[];
  amount: number;
  discountAmount: number;
  net: number;
  taxAmount: number;
  withholdingAmount: number;
  finalAmount: number;
  appliedToBill?: number | null;
  creditUsed?: number | null;
  creditRemaining?: number | null;
  journalTransaction?: string | null;
}

export interface VendorCreditsDto {
  advances: {
    id: string;
    transactionNumber: string;
    transactionDate: string;
    amount?: number;
    available: number;
  }[];
  returns: {
    id: string;
    transactionNumber: string;
    transactionDate: string;
    amount?: number;
    available: number;
  }[];
  total: number;
}

export interface PayablesAgingDto {
  asOf: string;
  rows: {
    vendor?: PartyDto | string | null;
    vendorId?: string;
    vendorName?: string;
    billCount: number;
    totalRemaining: number;
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    over90: number;
  }[];
  totals: {
    billCount: number;
    totalRemaining: number;
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    over90: number;
  };
}

export interface MyPermissionsDto {
  role: string;
  permissions: {
    menuId: string;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }[];
}
