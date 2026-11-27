import type { OrderItemStatus } from '@/module/purchases/domain/purchaseDocuments';
import type { LineDto } from '@/module/purchases/infrastructure/purchaseDto';
import type { ReorderLineFieldsDto } from '@/module/purchases/infrastructure/purchaseReorderDto';

export interface OrderItemDto extends LineDto, ReorderLineFieldsDto {
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
