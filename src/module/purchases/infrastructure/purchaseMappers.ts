import type {
  ApprovalState,
  Attachment,
  Page,
  PartyRef,
  PaymentMethodRef,
  ProductRef,
  TaxRef,
} from '@/module/purchases/domain/purchaseCommon';
import type {
  ApprovalFieldsDto,
  AttachmentDto,
  IdOr,
  ListDto,
  PartyDto,
  PaymentMethodDto,
  ProductDto,
  TaxDto,
} from '@/module/purchases/infrastructure/purchaseDto';

/** The API stores dates as UTC midnight; the calendar day is the first ten characters. */
export const toDate = (value: string | null | undefined): string =>
  value ? value.slice(0, 10) : '';
export const toDateOrNull = (value: string | null | undefined): string | null =>
  value ? value.slice(0, 10) : null;

export const refId = <T extends { id: string }>(value: IdOr<T> | null | undefined): string =>
  value == null ? '' : typeof value === 'string' ? value : value.id;

export const toParty = (dto: PartyDto): PartyRef => ({
  id: dto.id,
  name: dto.displayName?.trim() || '-',
  paymentTermDays: dto.mappingAccount?.defaultPaymentTerm ?? null,
  npwp: dto.npwp ?? null,
});

export const toProduct = (dto: ProductDto | null | undefined): ProductRef | null =>
  dto
    ? {
        id: dto.id,
        name: dto.name,
        sku: dto.sku ?? null,
        unitName: dto.unit?.name ?? null,
        isInventory: Boolean(dto.inventoryInfo?.isTracked),
      }
    : null;

export const toTax = (dto: TaxDto | null | undefined): TaxRef | null =>
  dto ? { id: dto.id, name: dto.name, rate: dto.rate } : null;

export const toPaymentMethod = (
  dto: PaymentMethodDto | null | undefined
): PaymentMethodRef | null =>
  dto
    ? {
        id: dto.id,
        name: dto.name,
        adminFee: dto.adminFee ?? 0,
        accountName: dto.defaultAccount?.name ?? null,
      }
    : null;

export const toAttachments = (dtos: AttachmentDto[] | null | undefined): Attachment[] =>
  (dtos ?? []).map((dto, index) => ({
    id: dto._id ?? dto.id ?? String(index),
    name: dto.originalName ?? dto.filename ?? dto.name ?? 'Lampiran',
    url: dto.url ?? dto.path ?? '',
  }));

export const toApproval = (dto: ApprovalFieldsDto): ApprovalState => ({
  plan: (dto.approvalPlan ?? []).map((level) => ({
    name: level.name,
    mode: level.mode,
    roles: level.roles.map((role) => ({ id: role.role, name: role.name })),
  })),
  entries: (dto.approvals ?? []).map((entry) => ({
    level: entry.level,
    roleId: entry.role,
    byId: entry.by,
    at: entry.at,
  })),
  pending: (dto.pendingApprovers ?? []).map((level) => ({
    level: level.level,
    name: level.name,
    mode: level.mode,
    roles: level.roles,
  })),
  canDecide: Boolean(dto.canDecide),
  rejectionReason: dto.rejectionReason ?? null,
  rejectedAt: dto.rejectedAt ?? null,
});

export const toPage = <T, U>(dto: ListDto<T>, map: (item: T) => U): Page<U> => ({
  items: dto.results.map(map),
  page: dto.page,
  limit: dto.limit,
  totalPages: dto.totalPages,
  totalResults: dto.totalResults,
});
