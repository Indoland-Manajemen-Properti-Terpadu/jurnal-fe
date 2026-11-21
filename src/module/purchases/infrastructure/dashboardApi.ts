import type {
  DashboardActions,
  DashboardConfig,
  DashboardSummary,
} from '@/module/purchases/domain/dashboard';
import type { ChainType, DocumentChain } from '@/module/purchases/domain/documentChain';
import type { ApiEnvelope } from '@/module/purchases/infrastructure/purchaseDto';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';

const DASHBOARD = '/v1/purchase-dashboard';

interface SummaryDto extends Omit<DashboardSummary, 'payables'> {
  payables?: DashboardSummary['payables'];
}

interface ActionsDto {
  total: number;
  late: number;
  items: {
    key: string;
    title: string;
    subtitle?: string | null;
    cta?: string | null;
    target: DashboardActions['items'][number]['target'];
    waiting?: number | null;
    late?: number | null;
    due?: string | null;
  }[];
}

/** Counts per stage, procurement routes, what is ready to pay and, with the report right, payables. */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await http.get<ApiEnvelope<SummaryDto>>(`${DASHBOARD}/summary`);
  return { ...data, payables: data.payables ?? null };
};

/** "Perlu tindakan": what this user can act on now, most overdue first (the server sorts it). */
export const getDashboardActions = async (): Promise<DashboardActions> => {
  const { data } = await http.get<ApiEnvelope<ActionsDto>>(`${DASHBOARD}/actions`);
  return {
    total: data.total,
    late: data.late,
    items: data.items.map((item) => ({
      key: item.key,
      title: item.title,
      subtitle: item.subtitle ?? '',
      cta: item.cta ?? '',
      target: item.target,
      waiting: item.waiting ?? null,
      late: item.late ?? null,
      due: item.due ?? null,
    })),
  };
};

export const getDashboardConfig = async (): Promise<DashboardConfig> =>
  (await http.get<ApiEnvelope<DashboardConfig>>(`${DASHBOARD}/config`)).data;

/** Every document linked to one document: the request it came from down to payments and returns. */
export const getDocumentChain = async (type: ChainType, id: string): Promise<DocumentChain> => {
  const { data } = await http.get<
    ApiEnvelope<Partial<DocumentChain> & { start: { type: ChainType; id: string } }>
  >(`${DASHBOARD}/chain`, { type, id });
  return {
    purchaseRequests: data.purchaseRequests ?? [],
    purchaseOrders: data.purchaseOrders ?? [],
    goodsReceipts: data.goodsReceipts ?? [],
    purchaseBills: data.purchaseBills ?? [],
    paymentRequests: data.paymentRequests ?? [],
    purchasePayments: data.purchasePayments ?? [],
    purchaseReturns: data.purchaseReturns ?? [],
  };
};
