import { useQuery } from '@tanstack/react-query';
import type {
  DashboardActions,
  DashboardConfig,
  DashboardSummary,
} from '@/module/purchases/domain/dashboard';
import {
  chainSteps,
  type ChainType,
  type DocumentChain,
  type JourneyStepData,
} from '@/module/purchases/domain/documentChain';
import {
  getDashboardActions,
  getDashboardConfig,
  getDashboardSummary,
  getDocumentChain,
} from '@/module/purchases/infrastructure/dashboardApi';
import type { PurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import { setAmountPrecision } from '@/module/purchases/presentation/components/shared/format';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

const STABLE_MS = 5 * 60 * 1000;

export const useDashboardSummary = (enabled = true) => {
  const scope = usePurchaseScope();
  return useQuery<DashboardSummary, PurchaseError>({
    queryKey: purchaseKeys.dashboard(scope, 'summary'),
    queryFn: getDashboardSummary,
    enabled,
  });
};

export const useDashboardActions = (enabled = true) => {
  const scope = usePurchaseScope();
  return useQuery<DashboardActions, PurchaseError>({
    queryKey: purchaseKeys.dashboard(scope, 'actions'),
    queryFn: getDashboardActions,
    enabled,
  });
};

/**
 * The money precision of the general settings. Every purchasing screen formats amounts with it, so the
 * value is handed to `formatAmount` as soon as it arrives.
 */
export const useDashboardConfig = () => {
  const scope = usePurchaseScope();
  const query = useQuery<DashboardConfig, PurchaseError>({
    queryKey: purchaseKeys.dashboard(scope, 'config'),
    queryFn: getDashboardConfig,
    staleTime: STABLE_MS,
  });
  if (query.data) {
    setAmountPrecision(query.data.precision);
  }
  return query;
};

/** The chain a document belongs to, as the steps of the journey card. */
export const useDocumentChain = (
  type: ChainType,
  id: string | undefined
): { steps: JourneyStepData[]; chain: DocumentChain | undefined; isLoading: boolean } => {
  const scope = usePurchaseScope();
  const query = useQuery({
    queryKey: purchaseKeys.chain(scope, type, id ?? ''),
    queryFn: () => getDocumentChain(type, id as string),
    enabled: Boolean(id),
  });
  return {
    steps: query.data && id ? chainSteps(query.data, { type, id }) : [],
    chain: query.data,
    isLoading: query.isLoading,
  };
};
