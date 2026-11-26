import type {
  ReorderInput,
  ReorderPreview,
  ReorderSource,
} from '@/module/purchases/domain/purchaseReorder';
import type {
  ApiEnvelope,
  ListDto,
  PurchaseOrderDto,
} from '@/module/purchases/infrastructure/purchaseDto';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import { toPurchaseOrder } from '@/module/purchases/infrastructure/purchaseDocumentMappers';

type ReorderSourceDto = Pick<
  PurchaseOrderDto,
  'id' | 'transactionNumber' | 'transactionDate' | 'vendor' | 'items'
> & {
  canReorder?: boolean;
  reorderBlockReason?: string | null;
  total?: number;
  finalAmount?: number;
};

export const listReorderSources = async (search = '', page = 1, limit = 20) => {
  const { data } = await http.get<ApiEnvelope<ListDto<ReorderSourceDto>>>(
    `${PURCHASE_API.orders}/reorder-sources`,
    { search, page, limit }
  );
  return {
    ...data,
    results: data.results.map(
      (source): ReorderSource => ({
        id: source.id,
        number: source.transactionNumber,
        date: source.transactionDate,
        vendorName: source.vendor.displayName ?? '',
        itemNames: source.items
          .map((item) => item.product?.name ?? item.description ?? '')
          .filter(Boolean),
        total: source.finalAmount ?? source.total ?? 0,
        canReorder: Boolean(source.canReorder),
        reorderBlockReason: source.reorderBlockReason ?? null,
      })
    ),
  };
};

export const previewReorder = async (id: string, input: ReorderInput): Promise<ReorderPreview> =>
  (await http.post<ApiEnvelope<ReorderPreview>>(`${PURCHASE_API.order(id)}/reorder/preview`, input))
    .data;

export const createReorder = async (id: string, input: ReorderInput & { idempotencyKey: string }) =>
  toPurchaseOrder(
    (await http.post<ApiEnvelope<PurchaseOrderDto>>(`${PURCHASE_API.order(id)}/reorder`, input))
      .data
  );

export const approveReorder = async (id: string, approvalStage: number, note?: string) =>
  toPurchaseOrder(
    (
      await http.post<ApiEnvelope<PurchaseOrderDto>>(`${PURCHASE_API.order(id)}/reorder/approve`, {
        approvalStage,
        ...(note ? { note } : {}),
      })
    ).data
  );

export const rejectReorder = async (id: string, approvalStage: number, reason: string) =>
  toPurchaseOrder(
    (
      await http.post<ApiEnvelope<PurchaseOrderDto>>(`${PURCHASE_API.order(id)}/reorder/reject`, {
        approvalStage,
        reason,
      })
    ).data
  );
