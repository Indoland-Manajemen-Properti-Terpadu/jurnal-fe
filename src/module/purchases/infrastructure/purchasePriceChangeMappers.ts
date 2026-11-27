import type { PriceChangeRequest } from '@/module/purchases/domain/purchasePriceChanges';
import type { PriceChangeDto } from '@/module/purchases/infrastructure/purchasePriceChangeDto';

export const toPriceChangeRequest = (
  dto: PriceChangeDto | null | undefined
): PriceChangeRequest | null => {
  if (!dto) return null;
  const orderId =
    typeof dto.purchaseOrder === 'string' ? dto.purchaseOrder : (dto.purchaseOrder?.id ?? '');
  const orderNumber =
    typeof dto.purchaseOrder === 'string' ? '' : (dto.purchaseOrder?.transactionNumber ?? '');
  const orderRef = dto.purchaseOrderRef;
  return {
    id: dto.id,
    status: dto.status,
    purchaseOrderId: orderRef?.id ?? orderId,
    purchaseOrderNumber: orderRef?.transactionNumber ?? orderRef?.number ?? orderNumber,
    reason: dto.reason ?? '',
    vendorInvoiceNumber: dto.vendorInvoiceNumber ?? '',
    vendorInvoiceTotal: dto.vendorInvoiceTotal ?? null,
    items: (dto.items ?? []).map((item) => {
      const orderItem = typeof item.purchaseOrderItem === 'string' ? null : item.purchaseOrderItem;
      return {
        purchaseOrderItemId:
          typeof item.purchaseOrderItem === 'string'
            ? item.purchaseOrderItem
            : item.purchaseOrderItem.id,
        description: item.description ?? orderItem?.description ?? '',
        oldUnitPrice: item.oldUnitPrice ?? 0,
        newUnitPrice: item.newUnitPrice,
      };
    }),
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
      ...(entry.note ? { note: entry.note } : {}),
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
    approvalStage: dto.approvalStage ?? null,
  };
};
