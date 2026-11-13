import { useMemo } from 'react';
import type { BankProvider } from '@/module/bank-connection/domain/connection';
import { localBankProviders } from '@/module/bank-connection/presentation/components/bankLogos';
import { useBankProviders } from '@/module/bank-connection/presentation/hooks/useBankConnectionQueries';

/**
 * The banks to offer. The backend's list wins. Until the backend has the resource (a 404), the banks
 * that have a logo in `src/assets/banks/` are offered instead, so the flow can be walked through.
 */
export const useAvailableProviders = () => {
  const query = useBankProviders();
  const fallback = query.error?.kind === 'unavailable';
  const providers: BankProvider[] | undefined = useMemo(
    () => (fallback ? localBankProviders() : query.data),
    [fallback, query.data]
  );
  return { ...query, providers, error: fallback ? null : query.error, isLocal: fallback };
};
