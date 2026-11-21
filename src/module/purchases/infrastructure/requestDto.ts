import type {
  AttachmentDto,
  DocumentDto,
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
export interface PurchaseRequestDto extends DocumentDto {
  status: string;
  statusLabel?: string | null;
  requiredDate?: string | null;
  department?: { id: string; name: string } | null;
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
  procurement?: { route?: 'BIDDING' | 'SINGLE' | null } | null;
}
