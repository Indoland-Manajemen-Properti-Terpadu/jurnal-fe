import type {
  OrderRef,
  Procurement,
  ProcurementStatus,
  Quote,
  QuoteScores,
  QuoteTotals,
  RejectedWinner,
  TermSnapshot,
} from '@/module/purchases/domain/procurement';
import type { NamedRef, UserInfo } from '@/module/purchases/domain/purchaseCommon';
import type {
  PurchaseRequest,
  PurchaseRequestStatus,
  RequestItem,
} from '@/module/purchases/domain/purchaseRequest';
import type { DocumentDto } from '@/module/purchases/infrastructure/purchaseDto';
import {
  toApproval,
  toAttachments,
  toDate,
  toDateOrNull,
  toParty,
  toProduct,
} from '@/module/purchases/infrastructure/purchaseMappers';
import type {
  OrderRefDto,
  PurchaseRequestDto,
  QuoteDto,
  RejectedWinnerDto,
  RequestItemDto,
  TermSnapshotDto,
  UserInfoDto,
} from '@/module/purchases/infrastructure/requestDto';

const toUser = (dto: UserInfoDto | null | undefined): UserInfo | null =>
  dto ? { id: dto.id, name: dto.name ?? '', email: dto.email ?? '', title: dto.title ?? '' } : null;

const toRequestItem = (dto: RequestItemDto): RequestItem => {
  const unit: NamedRef | null = dto.unit
    ? { id: dto.unit.id, name: dto.unit.name ?? '' }
    : dto.product?.unit
      ? { id: dto.product.unit.id ?? '', name: dto.product.unit.name ?? '' }
      : null;
  return {
    id: dto._id,
    kind: dto.kind,
    product: toProduct(dto.product),
    description: dto.description ?? '',
    specification: dto.specification ?? '',
    quantity: dto.quantity,
    unit,
  };
};

const toTerm = (dto: TermSnapshotDto | null | undefined): TermSnapshot | null =>
  dto
    ? {
        paymentTermId: dto.paymentTerm ?? '',
        name: dto.name ?? '',
        advanceType: dto.advanceType ?? 'none',
        billingSplit: dto.billingSplit ?? 'single',
        hasDueTerm: Boolean(dto.hasDueTerm),
        hasRetention: Boolean(dto.hasRetention),
        advancePercent: dto.advancePercent ?? 0,
        installments: dto.installments ?? null,
        installmentPercents: dto.installmentPercents ?? [],
        dueDays: dto.dueDays ?? null,
        periods: dto.periods ?? null,
        retentionPercent: dto.retentionPercent ?? 0,
        maintenanceMonths: dto.maintenanceMonths ?? 0,
      }
    : null;

const score = (value: number | null | undefined): number | null => value ?? null;

const toScores = (dto: QuoteDto['scores']): QuoteScores => ({
  price: score(dto?.price),
  spec: score(dto?.spec),
  delivery: score(dto?.delivery),
  term: score(dto?.term),
});

/**
 * The service keeps the discount as a mode and a value, and still sends the rupiah amount. A quote
 * from before the mode existed has only the amount, which is then a rupiah discount.
 */
const toDiscount = (dto: QuoteDto): Pick<Quote, 'discountType' | 'discountValue'> =>
  dto.discountType === 'percentage'
    ? { discountType: 'percentage', discountValue: dto.discountValue ?? 0 }
    : { discountType: 'nominal', discountValue: dto.discountValue || (dto.discountAmount ?? 0) };

const toQuote = (dto: QuoteDto): Quote => ({
  id: dto._id,
  vendor: toParty(dto.vendor),
  number: dto.quotationNumber ?? '',
  validUntil: toDateOrNull(dto.validUntil),
  description: dto.description ?? '',
  attachments: toAttachments(dto.attachments),
  paymentTermId: dto.paymentTerm ?? '',
  term: toTerm(dto.termSnapshot),
  leadDays: dto.leadDays ?? null,
  warranty: dto.warranty ?? '',
  withReceipt: dto.withReceipt !== false,
  isPriceIncludeTax: Boolean(dto.isPriceIncludeTax),
  ...toDiscount(dto),
  discountAmount: dto.discountAmount ?? 0,
  shippingAmount: dto.shippingAmount ?? 0,
  lines: (dto.lines ?? []).map((line) => ({
    requestItemId: line.requestItem,
    unitPrice: line.unitPrice,
    finalPrice: line.finalPrice ?? null,
    specification: line.specification ?? '',
    taxId: line.tax?.id ?? '',
    taxName: line.tax?.name ?? '',
  })),
  scores: toScores(dto.scores),
});

/** Newest first, so the latest reason for a vendor is the one found first. */
const toRejectedWinners = (list: RejectedWinnerDto[] | null | undefined): RejectedWinner[] =>
  (list ?? [])
    .map((entry) => ({
      vendorId: entry.vendor,
      reason: entry.reason ?? '',
      rejectedAt: entry.rejectedAt ?? null,
      rejectedByName: entry.rejectedByInfo?.name ?? '',
      amount: entry.amount ?? null,
    }))
    .sort((a, b) => (b.rejectedAt ?? '').localeCompare(a.rejectedAt ?? ''));

const toProcurement = (dto: PurchaseRequestDto): Procurement => {
  const base = dto.procurement;
  const view = dto.procurementView;
  const totals: Record<string, QuoteTotals> = {};
  (view?.quotes ?? []).forEach((entry) => {
    totals[entry.id] = {
      complete: Boolean(entry.complete),
      rejected: Boolean(entry.rejected),
      subtotal: entry.subtotal ?? 0,
      discountAmount: entry.discountAmount ?? 0,
      taxAmount: entry.taxAmount ?? 0,
      shippingAmount: entry.shippingAmount ?? 0,
      total: entry.total ?? 0,
      score: entry.score ?? null,
      vendorOrders: entry.vendorHistory?.orders ?? 0,
      vendorLastOrderDate: toDateOrNull(entry.vendorHistory?.lastOrderDate),
    };
  });
  return {
    route: base?.route ?? null,
    rejectedWinners: toRejectedWinners(view?.rejectedWinners),
    status: (base?.status ?? 'DRAFT') as ProcurementStatus,
    singleReason: base?.singleReason ?? '',
    belowMinQuotesReason: base?.belowMinQuotesReason ?? '',
    winnerId: base?.winner ?? null,
    reason: base?.reason ?? '',
    negotiationNote: base?.negotiationNote ?? '',
    negotiationAttachments: toAttachments(base?.negotiationAttachments),
    quotes: (base?.quotes ?? []).map(toQuote),
    totals,
    cheapestVendorId: view?.cheapestVendor ?? null,
    estimatedValue: view?.estimatedValue ?? 0,
    minQuotes: view?.minQuotes ?? 1,
    biddingNumber: view?.biddingNumber ?? '',
    submitErrors: view?.submitErrors ?? [],
    scoreCriteria: view?.scoreCriteria ?? [],
    approvalPreview: (view?.approvalPreview ?? []).map((level) => ({
      name: level.name,
      mode: level.mode,
      roles: level.roles,
    })),
    approval: toApproval(dto),
  };
};

const toOrderRef = (dto: OrderRefDto): OrderRef => ({
  id: dto.id,
  number: dto.transactionNumber,
  isService: Boolean(dto.isService),
  total: dto.total ?? 0,
  status: dto.status,
});

const documentBase = (dto: DocumentDto) => ({
  id: dto.id,
  number: dto.transactionNumber,
  date: toDate(dto.transactionDate),
  memo: dto.memo ?? '',
  createdById: dto.createdBy,
  createdAt: dto.createdAt,
  attachments: toAttachments(dto.attachments),
});

export const toPurchaseRequest = (dto: PurchaseRequestDto): PurchaseRequest => ({
  ...documentBase(dto),
  status: dto.status as PurchaseRequestStatus,
  statusLabel: dto.statusLabel ?? '',
  requiredDate: toDateOrNull(dto.requiredDate),
  department: dto.department ? { id: dto.department.id, name: dto.department.name } : null,
  purpose: dto.purpose ?? '',
  deliveryWarehouse: dto.deliveryWarehouse
    ? {
        id: dto.deliveryWarehouse.id,
        code: dto.deliveryWarehouse.code ?? '',
        name: dto.deliveryWarehouse.name ?? '',
      }
    : null,
  iom: {
    number: dto.iom?.number ?? '',
    date: toDateOrNull(dto.iom?.date),
    attachments: toAttachments(dto.iom?.attachments),
  },
  requester: toUser(dto.requesterInfo),
  verifiedBy: toUser(dto.verifiedByInfo),
  returnedBy: toUser(dto.returnedByInfo),
  returnNote: dto.returnNote ?? '',
  cancelReason: dto.cancelReason ?? '',
  items: dto.items.map(toRequestItem),
  isOwner: Boolean(dto.isOwner),
  route: dto.procurement?.route ?? null,
  procurement: toProcurement(dto),
  orders: (dto.purchaseOrderRefs ?? []).map(toOrderRef),
  readyForOrder: Boolean(dto.readyForOrder),
});
