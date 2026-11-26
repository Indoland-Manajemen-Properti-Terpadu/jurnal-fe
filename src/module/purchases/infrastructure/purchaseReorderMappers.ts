import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseOrderDto } from '@/module/purchases/infrastructure/purchaseDto';

type ReorderOrderFields = Pick<
  PurchaseOrder,
  | 'canReorder'
  | 'reorderBlockReason'
  | 'reorderSourceRef'
  | 'reorderedOrders'
  | 'reorder'
  | 'approvalPlan'
  | 'pendingApprovers'
  | 'canDecide'
  | 'approvalStage'
  | 'rejectionReason'
>;

export const toReorderOrderFields = (dto: PurchaseOrderDto): ReorderOrderFields => ({
  canReorder: Boolean(dto.canReorder),
  reorderBlockReason: dto.reorderBlockReason ?? null,
  reorderSourceRef: dto.reorderSourceRef
    ? {
        id: dto.reorderSourceRef.id,
        number: dto.reorderSourceRef.transactionNumber ?? '',
      }
    : null,
  reorderedOrders: (dto.reorderedOrders ?? []).map((ref) => ({
    id: ref.id,
    number: ref.transactionNumber ?? '',
    status: ref.status,
  })),
  reorder: dto.reorder
    ? {
        note: dto.reorder.note ?? '',
        sourceTotal: dto.reorder.sourceTotal ?? 0,
        priceIncreased: Boolean(dto.reorder.priceIncreased),
        totalIncreased: Boolean(dto.reorder.totalIncreased),
      }
    : null,
  approvalPlan: dto.approvalPlan ?? [],
  pendingApprovers: dto.pendingApprovers ?? [],
  canDecide: Boolean(dto.canDecide),
  approvalStage: dto.approvalStage ?? dto.pendingApprovers?.[0]?.level ?? null,
  rejectionReason: dto.rejectionReason ?? null,
});
