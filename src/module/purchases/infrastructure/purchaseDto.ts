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
  unit?: { name?: string | null } | null;
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
  name?: string;
  filename?: string;
  originalName?: string;
  url?: string;
  path?: string;
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

export interface RequestItemDto {
  _id: string;
  product?: ProductDto | null;
  description?: string | null;
  quantity: number;
  unit?: { name?: string | null } | null;
}

export interface QuotationDto {
  _id: string;
  vendor: PartyDto;
  quotationNumber?: string | null;
  quotationDate: string;
  validUntil?: string | null;
  items: { requestItem: string; quantity: number; unitPrice: number }[];
  total: number;
  notes?: string | null;
}

export interface PurchaseRequestDto extends DocumentDto, ApprovalFieldsDto {
  requiredDate?: string | null;
  department?: string | null;
  purpose?: string | null;
  procurementMode: 'DIRECT' | 'WITH_QUOTATION';
  status: string;
  items: RequestItemDto[];
  quotations?: QuotationDto[] | null;
  selectedQuotation?: string | null;
  purchaseOrder?: IdOr<{ id: string }> | null;
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
  receivedQty: number;
  billedQty: number;
}

export interface PurchaseOrderDto extends DocumentDto, AmountsDto, ApprovalFieldsDto {
  expectedDate?: string | null;
  vendor: PartyDto;
  purchaseRequest: IdOr<{ id: string }>;
  paymentTerm?: { name?: string | null } | null;
  deliveryAddress?: string | null;
  status: string;
  items: OrderItemDto[];
}

export interface GoodsReceiptDto extends DocumentDto {
  vendor: PartyDto;
  purchaseOrder: IdOr<{ id: string }>;
  deliveryNote?: string | null;
  status: string;
  items: {
    _id: string;
    purchaseOrderItem: string;
    product?: ProductDto | null;
    description?: string | null;
    receivedQty: number;
    accrualAmount: number;
  }[];
  journalTransaction?: string | null;
}

export interface BillItemDto extends LineDto {
  purchaseOrderItem: string;
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

export interface PurchaseBillDto extends DocumentDto, AmountsDto {
  vendorInvoiceNumber?: string | null;
  vendorInvoiceTotal?: number | null;
  vendor: PartyDto;
  purchaseOrder: IdOr<{ id: string }>;
  dueDate?: string | null;
  status: string;
  items: BillItemDto[];
  paidAmount: number;
  returnedAmount: number;
  creditAppliedAmount: number;
  remainingAmount: number;
  variances?: { type: 'PRICE' | 'TOTAL'; expected?: number; actual?: number }[] | null;
  creditApplications?: CreditApplicationDto[] | null;
  journalTransaction?: string | null;
  verifiedAt?: string | null;
}

export interface PaymentVoucherDto extends DocumentDto, ApprovalFieldsDto {
  type?: 'BILL' | 'ADVANCE' | null;
  vendor: PartyDto;
  status: string;
  items?: { bill: IdOr<{ id: string }>; amount: number }[] | null;
  totalAmount: number;
  advanceAppliedAmount?: number | null;
  purchaseOrder?: IdOr<{ id: string }> | null;
  paymentMethod?: PaymentMethodDto | null;
  adminFee?: number | null;
  referenceNumber?: string | null;
  journalTransaction?: string | null;
  paidAt?: string | null;
}

export interface PurchaseReturnDto extends DocumentDto {
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
