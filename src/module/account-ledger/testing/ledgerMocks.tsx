import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@test-utils';

/** Mutable state read by the module mocks below; reset it in `beforeEach`. */
export const ledgerState = {
  detail: undefined as Record<string, unknown> | undefined,
  detailLoading: false,
  transactions: undefined as Record<string, unknown>[] | undefined,
  transactionsLoading: false,
  transactionsError: false,
  recon: undefined as Record<string, unknown> | undefined,
  bankStatement: undefined as Record<string, unknown> | undefined,
};

export const fns = {
  deleteAccount: vi.fn(),
  deleteAccountPending: false,
  archiveAccount: vi.fn(),
  deleteEntries: vi.fn(),
  refetchTransactions: vi.fn(),
  notify: vi.fn(),
  reconCalls: [] as string[],
  bankStatementCalls: [] as string[],
};

export const resetLedgerMocks = () => {
  ledgerState.detail = undefined;
  ledgerState.detailLoading = false;
  ledgerState.transactions = undefined;
  ledgerState.transactionsLoading = false;
  ledgerState.transactionsError = false;
  ledgerState.recon = undefined;
  ledgerState.bankStatement = undefined;
  fns.deleteAccountPending = false;
  fns.reconCalls.length = 0;
  fns.bankStatementCalls.length = 0;
  Object.values(fns).forEach((fn) => {
    if (typeof fn === 'function' && 'mockReset' in fn) (fn as ReturnType<typeof vi.fn>).mockReset();
  });
};

export const chartOfAccountsMock = async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/module/chart-of-accounts');
  return {
    ...actual,
    useDetailAccount: () => ({
      accountDetail: ledgerState.detail,
      isLoading: ledgerState.detailLoading,
      isError: false,
    }),
    useDeleteAccount: () => ({
      mutate: fns.deleteAccount,
      isPending: fns.deleteAccountPending,
    }),
    archiveAccount: (id: string) => fns.archiveAccount(id),
    CashMapping: () => <div>cash-mapping-stub</div>,
  };
};

type TableProps = {
  data?: unknown[];
  selectedRecords: unknown[];
  setSelectedRecords: (rows: unknown[]) => void;
  noRecordsContent?: ReactNode;
};

export const journalEntriesMock = async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/module/journal-entries');
  return {
    ...actual,
    useJournalEntriesByAccount: () => ({
      data: ledgerState.transactions,
      isLoading: ledgerState.transactionsLoading,
      isError: ledgerState.transactionsError,
      refetch: fns.refetchTransactions,
    }),
    useDeleteJournalEntries: () => ({ mutate: fns.deleteEntries, isPending: false }),
    JournalEntriesTable: ({
      data,
      selectedRecords,
      setSelectedRecords,
      noRecordsContent,
    }: TableProps) => (
      <div>
        <span>rows:{data ? data.length : 'none'}</span>
        <span>selected:{selectedRecords.length}</span>
        <button type="button" onClick={() => setSelectedRecords(data ?? [])}>
          select-all-rows
        </button>
        {(!data || data.length === 0) && <div>{noRecordsContent}</div>}
      </div>
    ),
  };
};

export const bankStatementsMock = async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/module/bank-statements');
  return {
    ...actual,
    useBankStatement: (id: string) => {
      fns.bankStatementCalls.push(id);
      return { data: ledgerState.bankStatement, isLoading: false };
    },
    BankStatementTable: () => <div>bank-statement-table-stub</div>,
  };
};

export const reconciliationMock = async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/module/reconciliation');
  return {
    ...actual,
    useReconciliation: (id: string) => {
      fns.reconCalls.push(id);
      return { data: ledgerState.recon, isLoading: false };
    },
    ReconciliationTable: () => <div>reconciliation-table-stub</div>,
  };
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

export const makeQueryClient = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.spyOn(client, 'refetchQueries').mockResolvedValue(undefined);
  vi.spyOn(client, 'invalidateQueries').mockResolvedValue(undefined);
  return client;
};

/** Renders a page element at `/ledger/:idAccount` with a location probe for navigations. */
export const renderLedger = (element: ReactNode, client = makeQueryClient(), id = 'acc-1') => {
  const result = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/ledger/${id}`]}>
        <Routes>
          <Route path="/ledger/:idAccount" element={element} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { ...result, client };
};

export const journalRow = (debit: number, credit: number, id = `j-${debit}-${credit}`) => ({
  id,
  debit,
  credit,
});
