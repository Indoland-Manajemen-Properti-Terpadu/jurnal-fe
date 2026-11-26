import type {
  DashboardActions,
  DashboardConfig,
  DashboardSummary,
} from '@/module/purchases/domain/dashboard';
import type {
  ChainDocument,
  ChainType,
  DocumentChain,
} from '@/module/purchases/domain/documentChain';
import type { ApiEnvelope } from '@/module/purchases/infrastructure/purchaseDto';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import {
  toRetentionSummary,
  type SummaryRetentionDto,
} from '@/module/purchases/infrastructure/retentionApi';

const DASHBOARD = '/v1/purchase-dashboard';

interface SummaryDto extends Omit<DashboardSummary, 'payables' | 'retention'> {
  payables?: DashboardSummary['payables'];
  retention?: SummaryRetentionDto;
}

interface ActionsDto {
  total: number;
  late: number;
  bySeverity?: DashboardActions['bySeverity'];
  oldest?: ActionsDtoItem | null;
  items: ActionsDtoItem[];
}

interface ActionsDtoItem {
  key: string;
  title: string;
  subtitle?: string | null;
  cta?: string | null;
  target: DashboardActions['items'][number]['target'];
  waiting?: number | null;
  late?: number | null;
  due?: string | null;
  severity?: DashboardActions['items'][number]['severity'];
}

const toAction = (item: ActionsDtoItem): DashboardActions['items'][number] => ({
  key: item.key,
  title: item.title,
  subtitle: item.subtitle ?? '',
  cta: item.cta ?? '',
  target: item.target,
  waiting: item.waiting ?? null,
  late: item.late ?? null,
  due: item.due ?? null,
  severity: item.severity,
});

/** Counts per stage, procurement routes, what is ready to pay and, with the report right, payables. */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await http.get<ApiEnvelope<SummaryDto>>(`${DASHBOARD}/summary`);
  return {
    ...data,
    payables: data.payables ?? null,
    retention: toRetentionSummary(data.retention),
  };
};

/** "Perlu tindakan": what this user can act on now, most overdue first (the server sorts it). */
export const getDashboardActions = async (): Promise<DashboardActions> => {
  const { data } = await http.get<ApiEnvelope<ActionsDto>>(`${DASHBOARD}/actions`);
  return {
    total: data.total,
    late: data.late,
    bySeverity: data.bySeverity,
    oldest: data.oldest ? toAction(data.oldest) : null,
    items: data.items.map(toAction),
  };
};

export const getDashboardConfig = async (): Promise<DashboardConfig> =>
  (await http.get<ApiEnvelope<DashboardConfig>>(`${DASHBOARD}/config`)).data;

interface ChainDocumentDto {
  id: string;
  transactionNumber?: string | null;
  status?: string | null;
  statusLabel?: string | null;
  kind?: string | null;
  procurement?: { routeLabel?: string | null; statusLabel?: string | null } | null;
}

type ChainDto = Partial<Record<keyof DocumentChain, ChainDocumentDto[]>>;

const toChainDocs = (docs: ChainDocumentDto[] | undefined): ChainDocument[] =>
  (docs ?? []).map((doc) => ({
    id: doc.id,
    number: doc.transactionNumber ?? '',
    status: doc.status ?? '',
    statusLabel: doc.statusLabel ?? undefined,
    kind: doc.kind ?? undefined,
    procurement: doc.procurement?.routeLabel
      ? {
          routeLabel: doc.procurement.routeLabel,
          statusLabel: doc.procurement.statusLabel ?? '',
        }
      : undefined,
  }));

/** Every document linked to one document: the request it came from down to payments and returns. */
export const getDocumentChain = async (type: ChainType, id: string): Promise<DocumentChain> => {
  const { data } = await http.get<ApiEnvelope<ChainDto>>(`${DASHBOARD}/chain`, { type, id });
  return {
    purchaseRequests: toChainDocs(data.purchaseRequests),
    purchaseOrders: toChainDocs(data.purchaseOrders),
    goodsReceipts: toChainDocs(data.goodsReceipts),
    purchaseBills: toChainDocs(data.purchaseBills),
    paymentRequests: toChainDocs(data.paymentRequests),
    purchasePayments: toChainDocs(data.purchasePayments),
    purchaseReturns: toChainDocs(data.purchaseReturns),
  };
};
