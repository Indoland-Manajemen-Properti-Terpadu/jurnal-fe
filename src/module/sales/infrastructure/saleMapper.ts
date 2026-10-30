import type {
  Sale,
  SaleAttachment,
  SaleItem,
  SalePaymentDetail,
  SalePaymentMethod,
  SaleStatus,
  SaleTag,
} from '../domain/sale';
import { roundToCents } from '../domain/saleMoney';
import type {
  SaleAttachmentDto,
  SaleDto,
  SaleItemDto,
  SalePaymentDetailDto,
  SalePaymentMethodDto,
  SaleTagDto,
} from './saleDto';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

/** Money received from the API is rounded half up to the cent at this boundary. */
const toMoney = (value: unknown): number => roundToCents(toNumber(value));

const toOptionalMoney = (value: unknown): number | undefined =>
  value !== undefined && value !== null ? toMoney(value) : undefined;

const mapItem = (i: SaleItemDto): SaleItem => {
  const journalTransactionId =
    typeof i.journalTransaction === 'string' ? i.journalTransaction : i.journalTransaction?.id;

  return {
    id: i.id || i._id,
    product: i.product
      ? {
          id: (i.product.id || i.product._id) as string,
          name: i.product.name as string,
          productCode: i.product.productCode || i.product.code,
        }
      : null,
    description: i.description,
    quantity: toNumber(i.quantity),
    unitPrice: toMoney(i.unitPrice || i.unit_price),
    tax: i.tax
      ? {
          id: (i.tax.id || i.tax._id) as string,
          name: i.tax.name as string,
          rate: toNumber(i.tax.rate),
        }
      : null,
    taxAmount: toMoney(i.taxAmount),
    amount: toMoney(i.amount),
    adjustedAmount: toOptionalMoney(i.adjustedAmount),
    paidAmount: toMoney(i.paidAmount),
    journalTransaction:
      typeof i.journalTransaction === 'string'
        ? i.journalTransaction
        : i.journalTransaction?.id || i.journalTransaction?._id || null,
    journalId:
      i.journalId ||
      i.journal_id ||
      journalTransactionId ||
      i.journal?.id ||
      i.journal?._id ||
      null,
    transactionId:
      i.transactionId ||
      i.transaction_id ||
      i.transactionJournalId ||
      i.journalTransactionId ||
      journalTransactionId ||
      null,
    salesAccount: typeof i.salesAccount === 'string' ? i.salesAccount : i.salesAccount?.id || null,
    accountReceivable:
      typeof i.accountReceivable === 'string'
        ? i.accountReceivable
        : i.accountReceivable?.id || null,
  };
};

const mapAttachment = (a: SaleAttachmentDto): SaleAttachment => ({
  id: (a.id || a._id) as string,
  fileName: a.fileName || a.name,
  filePath: a.filePath || a.path,
  mimeType: a.mimeType,
  createdAt: a.createdAt,
});

const mapTags = (rawTags: SaleDto['tags']): SaleTag[] => {
  if (Array.isArray(rawTags)) {
    return rawTags.map((t: SaleTagDto) =>
      typeof t === 'string'
        ? { id: t, name: t }
        : { id: (t.id || t._id || t.name) as string, name: t.name || t.id || 'Tag' }
    );
  }
  if (typeof rawTags === 'string' && rawTags.trim()) {
    return rawTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ id: s, name: s }));
  }
  return [];
};

const emptySale = (): Sale => ({
  id: '',
  transactionNumber: '—',
  customer: null,
  emails: [],
  transactionDate: null,
  dueDate: null,
  tags: [],
  paymentTerm: null,
  isPriceIncludeTax: false,
  items: [],
  subtotal: 0,
  total: 0,
  finalAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  attachments: [],
  status: 'DRAFT',
  deleted: false,
  createdAt: null,
  updatedAt: null,
});

export const mapSaleDto = (dto: SaleDto | null | undefined): Sale => {
  if (!dto) return emptySale();

  const cust = dto.customer;

  return {
    id: dto.id || dto._id || '',
    site: dto.site,
    transactionNumber: dto.transactionNumber || dto.transaction_number || '—',
    customer: cust
      ? {
          id: (cust.id || cust._id) as string,
          displayName: cust.displayName || cust.name || 'Pelanggan',
          fullName: cust.fullName,
          contactNumber: cust.contactNumber,
          emails: Array.isArray(cust.emails) ? cust.emails : [],
          phones: cust.phones,
          billingAddress: cust.addresses?.billing?.general || cust.billingAddress,
          identity: cust.identity,
        }
      : null,
    emails: Array.isArray(dto.emails) ? dto.emails : [],
    billingAddress: dto.billingAddress,
    transactionDate: dto.transactionDate || null,
    dueDate: dto.dueDate || null,
    tags: mapTags(dto.tags ?? dto.tag),
    customerRefNumber: dto.customerRefNumber || null,
    paymentTerm: dto.paymentTerm
      ? {
          id: (dto.paymentTerm.id || dto.paymentTerm._id) as string,
          name: dto.paymentTerm.name as string,
          days: dto.paymentTerm.days,
          isDefault: dto.paymentTerm.isDefault,
        }
      : null,
    isPriceIncludeTax: Boolean(dto.isPriceIncludeTax),
    items: Array.isArray(dto.items) ? dto.items.map(mapItem) : [],
    subtotal: toMoney(dto.subtotal),
    discountType: dto.discountType,
    discountValue: toNumber(dto.discountValue),
    discountAmount: toMoney(dto.discountAmount),
    taxAmount: toMoney(dto.taxAmount),
    total: toMoney(dto.total),
    adjustedAmount: toOptionalMoney(dto.adjustedAmount),
    lateFeeAmount: toMoney(dto.lateFeeAmount),
    lateFeePaidAmount: toMoney(dto.lateFeePaidAmount),
    withholdingType: dto.withholdingType,
    withholdingValue: toNumber(dto.withholdingValue),
    withholdingAmount: toMoney(dto.withholdingAmount),
    withholdingAccount: dto.withholdingAccount
      ? {
          id: (dto.withholdingAccount.id || dto.withholdingAccount._id) as string,
          name: dto.withholdingAccount.name as string,
          accountNumber: dto.withholdingAccount.accountNumber,
        }
      : null,
    finalAmount: toMoney(dto.finalAmount ?? dto.total),
    paidAmount: toMoney(dto.paidAmount),
    remainingAmount: toMoney(dto.remainingAmount),
    attachments: Array.isArray(dto.attachments) ? dto.attachments.map(mapAttachment) : [],
    message: dto.message || null,
    memo: dto.memo || null,
    status: (dto.status || 'DRAFT') as SaleStatus,
    invoiceLink: dto.invoiceLink || null,
    journalId:
      dto.journalId ||
      dto.journal_id ||
      dto.journalTransactionId ||
      dto.transactionJournalId ||
      dto.journal?.id ||
      dto.journal?._id ||
      null,
    transactionId:
      dto.transactionId || dto.transaction_id || dto.journalId || dto.journal_id || null,
    deleted: Boolean(dto.deleted),
    createdAt: dto.createdAt || null,
    updatedAt: dto.updatedAt || null,
  };
};

export const mapSalePaymentDetail = (raw: SalePaymentDetailDto): SalePaymentDetail => ({
  id: (raw.id || raw._id) as string,
  site: raw.site,
  sale: raw.sale,
  depositAccount: raw.depositAccount,
  paymentMethod: raw.paymentMethod,
  paymentDate: raw.paymentDate ?? null,
  amount: toMoney(raw.amount),
  transactionNumber: raw.transactionNumber || '—',
  memo: raw.memo,
  createdAt: raw.createdAt ?? null,
});

export const mapSalePaymentMethod = (m: SalePaymentMethodDto): SalePaymentMethod => ({
  id: (m.id || m._id) as string,
  name: m.name as string,
  adminFee: toMoney(m.adminFee),
  external_id: m.external_id,
  isDefault: Boolean(m.isDefault),
  defaultAccount: m.defaultAccount,
  feeAccount: m.feeAccount,
});
