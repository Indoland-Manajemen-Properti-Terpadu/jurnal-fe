import type { NamedRef, UserInfo } from '@/module/purchases/domain/purchaseCommon';
import type {
  PurchaseRequest,
  PurchaseRequestStatus,
  RequestItem,
} from '@/module/purchases/domain/purchaseRequest';
import type { DocumentDto } from '@/module/purchases/infrastructure/purchaseDto';
import {
  toAttachments,
  toDate,
  toDateOrNull,
  toProduct,
} from '@/module/purchases/infrastructure/purchaseMappers';
import type {
  PurchaseRequestDto,
  RequestItemDto,
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
});
