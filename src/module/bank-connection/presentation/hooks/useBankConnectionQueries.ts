import { useQuery } from '@tanstack/react-query';
import type {
  BankConnection,
  BankProvider,
  ConnectionEvent,
  SyncRun,
} from '@/module/bank-connection/domain/connection';
import {
  getConnection,
  listConnections,
  listEvents,
  listProviders,
  listSyncRuns,
} from '@/module/bank-connection/infrastructure/bankConnectionApi';
import type { BankConnectionError } from '@/module/bank-connection/infrastructure/bankConnectionErrors';
import { bankConnectionKeys } from '@/module/bank-connection/presentation/hooks/bankConnectionKeys';
import { useConnectionScope } from '@/module/bank-connection/presentation/hooks/useConnectionScope';

/** Only a dropped connection is worth retrying; a refusal or a missing resource will not change. */
const retryNetwork = (count: number, error: BankConnectionError) =>
  error.kind === 'network' && count < 2;

export const useBankProviders = () => {
  const scope = useConnectionScope();
  return useQuery<BankProvider[], BankConnectionError>({
    queryKey: bankConnectionKeys.providers(scope),
    queryFn: listProviders,
    retry: retryNetwork,
    staleTime: 5 * 60_000,
  });
};

/** The connections of one account, newest state first as the backend answers. */
export const useAccountConnections = (accountId: string | undefined) => {
  const scope = useConnectionScope();
  return useQuery<BankConnection[], BankConnectionError>({
    queryKey: bankConnectionKeys.byAccount(scope, accountId ?? ''),
    queryFn: () => listConnections({ accountId }),
    enabled: Boolean(accountId),
    retry: retryNetwork,
  });
};

export const useBankConnection = (id: string | undefined) => {
  const scope = useConnectionScope();
  return useQuery<BankConnection, BankConnectionError>({
    queryKey: bankConnectionKeys.detail(scope, id ?? ''),
    queryFn: () => getConnection(id as string),
    enabled: Boolean(id),
    retry: retryNetwork,
  });
};

export const useSyncRuns = (id: string | undefined, enabled: boolean) => {
  const scope = useConnectionScope();
  return useQuery<SyncRun[], BankConnectionError>({
    queryKey: bankConnectionKeys.syncRuns(scope, id ?? ''),
    queryFn: () => listSyncRuns(id as string),
    enabled: Boolean(id) && enabled,
    retry: retryNetwork,
  });
};

export const useConnectionEvents = (id: string | undefined) => {
  const scope = useConnectionScope();
  return useQuery<ConnectionEvent[], BankConnectionError>({
    queryKey: bankConnectionKeys.events(scope, id ?? ''),
    queryFn: () => listEvents(id as string),
    enabled: Boolean(id),
    retry: retryNetwork,
  });
};
