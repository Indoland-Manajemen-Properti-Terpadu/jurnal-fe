import type {
  BillItem,
  CreditApplication,
  DocumentAmounts,
  GoodsReceipt,
  OrderItem,
  PayablesAging,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseReturn,
  Quotation,
  RequestItem,
  VendorCredits,
} from '@/module/purchases/domain/purchaseDocuments';
import type {
  AmountsDto,
  CreditApplicationDto,
  DocumentDto,
  GoodsReceiptDto,
  PayablesAgingDto,
  PaymentVoucherDto,
  PurchaseBillDto,
  PurchaseOrderDto,
  PurchaseRequestDto,
  PurchaseReturnDto,
  QuotationDto,
  RequestItemDto,
  VendorCreditsDto,
} from '@/module/purchases/infrastructure/purchaseDto';
import {
  refId,
  toApproval,
  toAttachments,
  toDate,
  toDateOrNull,
  toParty,
  toPaymentMethod,
  toProduct,
  toTax,
} from '@/module/purchases/infrastructure/purchaseMappers';

const base = (dto: DocumentDto) => ({
  id: dto.id,
  number: dto.transactionNumber,
  date: toDate(dto.transactionDate),
  memo: dto.memo ?? '',
  createdById: dto.createdBy,
  createdAt: dto.createdAt,
  attachments: toAttachments(dto.attachments),
});

const toAmounts = (dto: AmountsDto): DocumentAmounts => ({
  subtotal: dto.subtotal,
  discountType: dto.discountType ?? null,
  discountValue: dto.discountValue ?? 0,
  discountAmount: dto.discountAmount,
  taxAmount: dto.taxAmount,
  total: dto.total,
  withholdingType: dto.withholdingType ?? null,
  withholdingValue: dto.withholdingValue ?? 0,
  withholdingAmount: dto.withholdingAmount,
  withholdingTaxCode: dto.withholdingTaxCode ?? null,
  finalAmount: dto.finalAmount,
  isPriceIncludeTax: Boolean(dto.isPriceIncludeTax),
});

const toRequestItem = (dto: RequestItemDto): RequestItem => ({
  id: dto._id,
  product: toProduct(dto.product),
  description: dto.description ?? '',
  quantity: dto.quantity,
  unitName: dto.unit?.name ?? dto.product?.unit?.name ?? null,
});

const toQuotation = (dto: QuotationDto): Quotation => ({
  id: dto._id,
  vendor: toParty(dto.vendor),
  number: dto.quotationNumber ?? '',
  date: toDate(dto.quotationDate),
  validUntil: toDateOrNull(dto.validUntil),
  items: dto.items.map((item) => ({
    requestItemId: item.requestItem,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
  total: dto.total,
  notes: dto.notes ?? '',
});

export const toPurchaseRequest = (dto: PurchaseRequestDto): PurchaseRequest => ({
  ...base(dto),
  requiredDate: toDateOrNull(dto.requiredDate),
  department: dto.department ?? '',
  purpose: dto.purpose ?? '',
  mode: dto.procurementMode,
  status: dto.status as PurchaseRequest['status'],
  items: dto.items.map(toRequestItem),
  quotations: (dto.quotations ?? []).map(toQuotation),
  selectedQuotationId: dto.selectedQuotation ?? null,
  purchaseOrderId: refId(dto.purchaseOrder) || null,
  approval: toApproval(dto),
});

const toOrderItem = (dto: PurchaseOrderDto['items'][number]): OrderItem => ({
  id: dto._id,
  requestItemId: dto.requestItem,
  product: toProduct(dto.product),
  description: dto.description ?? '',
  quantity: dto.quantity,
  unitName: dto.unit?.name ?? dto.product?.unit?.name ?? null,
  unitPrice: dto.unitPrice,
  tax: toTax(dto.tax),
  discountAmount: dto.discountAmount,
  taxAmount: dto.taxAmount,
  amount: dto.amount,
  receivedQty: dto.receivedQty,
  billedQty: dto.billedQty,
});

export const toPurchaseOrder = (dto: PurchaseOrderDto): PurchaseOrder => ({
  ...base(dto),
  ...toAmounts(dto),
  expectedDate: toDateOrNull(dto.expectedDate),
  vendor: toParty(dto.vendor),
  purchaseRequestId: refId(dto.purchaseRequest),
  paymentTermName: dto.paymentTerm?.name ?? null,
  deliveryAddress: dto.deliveryAddress ?? '',
  status: dto.status as PurchaseOrder['status'],
  items: dto.items.map(toOrderItem),
  approval: toApproval(dto),
});

export const toGoodsReceipt = (dto: GoodsReceiptDto): GoodsReceipt => ({
  ...base(dto),
  vendor: toParty(dto.vendor),
  purchaseOrderId: refId(dto.purchaseOrder),
  deliveryNote: dto.deliveryNote ?? '',
  status: dto.status as GoodsReceipt['status'],
  items: dto.items.map((item) => ({
    id: item._id,
    purchaseOrderItemId: item.purchaseOrderItem,
    product: toProduct(item.product),
    description: item.description ?? '',
    receivedQty: item.receivedQty,
    accrualAmount: item.accrualAmount,
  })),
  journalId: dto.journalTransaction ?? null,
});

const toBillItem = (dto: PurchaseBillDto['items'][number]): BillItem => ({
  id: dto._id,
  purchaseOrderItemId: dto.purchaseOrderItem,
  product: toProduct(dto.product),
  description: dto.description ?? '',
  quantity: dto.quantity,
  unitName: dto.unit?.name ?? dto.product?.unit?.name ?? null,
  unitPrice: dto.unitPrice,
  tax: toTax(dto.tax),
  discountAmount: dto.discountAmount,
  taxAmount: dto.taxAmount,
  amount: dto.amount,
  returnedQty: dto.returnedQty ?? 0,
});

const toCreditApplication = (dto: CreditApplicationDto): CreditApplication => {
  const { source } = dto;
  const reference = source === 'ADVANCE' ? dto.advance : dto.purchaseReturn;
  return {
    id: dto._id ?? dto.id ?? '',
    source,
    sourceId: dto.sourceId ?? refId(reference),
    sourceNumber:
      typeof reference === 'object' && reference ? (reference.transactionNumber ?? '') : '',
    amount: dto.amount,
    date: toDate(dto.appliedAt),
    status: dto.voided ? 'VOID' : 'ACTIVE',
  };
};

export const toPurchaseBill = (dto: PurchaseBillDto): PurchaseBill => ({
  ...base(dto),
  ...toAmounts(dto),
  vendor: toParty(dto.vendor),
  purchaseOrderId: refId(dto.purchaseOrder),
  vendorInvoiceNumber: dto.vendorInvoiceNumber ?? '',
  vendorInvoiceTotal: dto.vendorInvoiceTotal ?? null,
  dueDate: toDateOrNull(dto.dueDate),
  status: dto.status as PurchaseBill['status'],
  items: dto.items.map(toBillItem),
  paidAmount: dto.paidAmount,
  returnedAmount: dto.returnedAmount,
  creditAppliedAmount: dto.creditAppliedAmount,
  remainingAmount: dto.remainingAmount,
  variances: (dto.variances ?? []).map((variance) => ({
    type: variance.type,
    expected: variance.expected ?? 0,
    actual: variance.actual ?? 0,
  })),
  creditApplications: (dto.creditApplications ?? []).map(toCreditApplication),
  journalId: dto.journalTransaction ?? null,
  verifiedAt: dto.verifiedAt ?? null,
});

export const toPaymentVoucher = (dto: PaymentVoucherDto): PaymentVoucher => ({
  ...base(dto),
  type: dto.type === 'ADVANCE' ? 'ADVANCE' : 'BILL',
  vendor: toParty(dto.vendor),
  status: dto.status as PaymentVoucher['status'],
  lines: (dto.items ?? []).map((line) => ({ billId: refId(line.bill), amount: line.amount })),
  totalAmount: dto.totalAmount,
  advanceAppliedAmount: dto.advanceAppliedAmount ?? 0,
  purchaseOrderId: refId(dto.purchaseOrder) || null,
  paymentMethod: toPaymentMethod(dto.paymentMethod),
  adminFee: dto.adminFee ?? 0,
  referenceNumber: dto.referenceNumber ?? '',
  journalId: dto.journalTransaction ?? null,
  paidAt: dto.paidAt ?? null,
  approval: toApproval(dto),
});

export const toPurchaseReturn = (dto: PurchaseReturnDto): PurchaseReturn => ({
  ...base(dto),
  vendor: toParty(dto.vendor),
  billId: refId(dto.bill),
  reason: dto.reason,
  status: dto.status as PurchaseReturn['status'],
  items: dto.items.map((item) => ({
    id: item._id,
    billItemId: item.billItem,
    product: toProduct(item.product),
    description: item.description ?? '',
    quantity: item.quantity,
    amount: item.amount,
    discountAmount: item.discountAmount,
    taxAmount: item.taxAmount,
  })),
  amount: dto.amount,
  discountAmount: dto.discountAmount,
  net: dto.net,
  taxAmount: dto.taxAmount,
  withholdingAmount: dto.withholdingAmount,
  finalAmount: dto.finalAmount,
  appliedToBill: dto.appliedToBill ?? 0,
  creditUsed: dto.creditUsed ?? 0,
  creditRemaining: dto.creditRemaining ?? 0,
  journalId: dto.journalTransaction ?? null,
});

export const toVendorCredits = (dto: VendorCreditsDto): VendorCredits => ({
  lines: [
    ...dto.advances.map((line) => ({
      id: line.id,
      source: 'ADVANCE' as const,
      number: line.transactionNumber,
      date: toDate(line.transactionDate),
      amount: line.amount ?? line.available,
      available: line.available,
    })),
    ...dto.returns.map((line) => ({
      id: line.id,
      source: 'RETURN' as const,
      number: line.transactionNumber,
      date: toDate(line.transactionDate),
      amount: line.amount ?? line.available,
      available: line.available,
    })),
  ],
  total: dto.total,
});

export const toPayablesAging = (dto: PayablesAgingDto): PayablesAging => ({
  asOf: toDate(dto.asOf),
  rows: dto.rows.map((row) => {
    const vendor = typeof row.vendor === 'object' && row.vendor ? row.vendor : null;
    return {
      vendorId: row.vendorId ?? vendor?.id ?? (typeof row.vendor === 'string' ? row.vendor : ''),
      vendorName: row.vendorName ?? vendor?.displayName ?? '-',
      billCount: row.billCount,
      totalRemaining: row.totalRemaining,
      current: row.current,
      days1to30: row.days1to30,
      days31to60: row.days31to60,
      days61to90: row.days61to90,
      over90: row.over90,
    };
  }),
  totals: dto.totals,
});
