import type { OrderRetention } from '@/module/purchases/domain/purchaseDocuments';
import { toDateOrNull } from '@/module/purchases/infrastructure/purchaseMappers';

export interface OrderRetentionDto {
  percent?: number | null;
  maintenanceMonths?: number | null;
  totalAmount?: number | null;
  heldAmount?: number | null;
  releasedAmount?: number | null;
  balance?: number | null;
  state?: string | null;
  maintenanceFrom?: string | null;
  releasableFrom?: string | null;
}

/** The retention block of an order; null when the order's terms hold nothing back. */
export const toOrderRetention = (
  dto: OrderRetentionDto | null | undefined
): OrderRetention | null =>
  dto && (dto.percent ?? 0) > 0
    ? {
        percent: dto.percent ?? 0,
        maintenanceMonths: dto.maintenanceMonths ?? 0,
        total: dto.totalAmount ?? 0,
        held: dto.heldAmount ?? 0,
        released: dto.releasedAmount ?? 0,
        balance: dto.balance ?? 0,
        state: dto.state ?? 'NONE',
        maintenanceFrom: toDateOrNull(dto.maintenanceFrom),
        releasableFrom: toDateOrNull(dto.releasableFrom),
      }
    : null;
