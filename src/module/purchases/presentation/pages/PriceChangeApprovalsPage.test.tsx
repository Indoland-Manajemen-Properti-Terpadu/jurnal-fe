import { fireEvent, render, screen } from '@test-utils';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { PriceChangeRequest } from '@/module/purchases/domain/purchasePriceChanges';
import PriceChangeApprovalsPage from './PriceChangeApprovalsPage';

const hooks = vi.hoisted(() => ({
  access: vi.fn(),
  list: vi.fn(),
  approve: vi.fn(),
  reject: vi.fn(),
  approveMutation: vi.fn(),
  rejectMutation: vi.fn(),
  retry: vi.fn(),
}));

vi.mock('@/module/purchases/presentation/hooks/usePurchaseAccess', () => ({
  usePurchaseAccess: hooks.access,
}));
vi.mock('@/module/purchases/presentation/hooks/usePurchaseQueries', () => ({
  usePriceChanges: hooks.list,
}));
vi.mock('@/module/purchases/presentation/hooks/usePurchaseMutations', () => ({
  useApprovePriceChange: hooks.approve,
  useRejectPriceChange: hooks.reject,
}));
vi.mock('@/module/purchases/presentation/components/shared/PageFrame', () => ({
  PageFrame: ({ children, title }: { children: ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));
vi.mock('@/module/purchases/presentation/components/requests/StateFrame', () => ({
  StateFrame: ({ kind, onRetry }: { kind: string; onRetry?: () => void }) =>
    kind === 'error' ? (
      <button type="button" onClick={onRetry}>
        Coba lagi
      </button>
    ) : (
      <div>{kind}</div>
    ),
}));
vi.mock('@/module/purchases/presentation/components/lists/PriceChangeList', () => ({
  PriceChangeList: ({
    requests,
    canDecide,
    onApprove,
  }: {
    requests: PriceChangeRequest[];
    canDecide: boolean;
    onApprove: (request: PriceChangeRequest, note?: string) => void;
  }) => (
    <div>
      {requests.map((item) => (
        <p key={item.id}>{item.purchaseOrderNumber}</p>
      ))}
      {canDecide && (
        <button type="button" onClick={() => onApprove(requests[0], 'Catatan antrean')}>
          Approve aktif
        </button>
      )}
    </div>
  ),
}));

const request: PriceChangeRequest = {
  id: 'change-1',
  status: 'PENDING_APPROVAL',
  purchaseOrderId: 'order-1',
  purchaseOrderNumber: 'PO-001',
  reason: 'Harga invoice vendor berbeda',
  vendorInvoiceNumber: 'INV-001',
  vendorInvoiceTotal: 1_100_000,
  items: [
    {
      purchaseOrderItemId: 'item-1',
      description: 'Meja rapat',
      oldUnitPrice: 1_000_000,
      newUnitPrice: 1_100_000,
    },
  ],
  plan: [
    { name: 'Chief Finance', mode: 'ANY', roles: [{ id: 'cf', name: 'Chief Finance' }] },
    { name: 'Building Manager', mode: 'ANY', roles: [{ id: 'bm', name: 'Building Manager' }] },
  ],
  entries: [],
  pending: [
    {
      level: 1,
      name: 'Building Manager',
      mode: 'ANY',
      roles: [{ id: 'bm', name: 'Building Manager', approved: false }],
    },
  ],
  canDecide: true,
  rejectionReason: null,
  rejectedAt: null,
  approvalStage: 1,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <PriceChangeApprovalsPage />
    </MemoryRouter>
  );

describe('PriceChangeApprovalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.access.mockReturnValue({ isLoading: false, can: () => true });
    hooks.list.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [request], totalPages: 1 },
      refetch: hooks.retry,
    });
    hooks.approve.mockReturnValue({ isPending: false, mutate: hooks.approveMutation });
    hooks.reject.mockReturnValue({ isPending: false, mutate: hooks.rejectMutation });
  });

  it('sends the current approval stage when approving from the queue', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Approve aktif' }));

    expect(hooks.approveMutation).toHaveBeenCalledWith({
      id: 'change-1',
      approvalStage: 1,
      note: 'Catatan antrean',
    });
  });

  it('shows an empty state when there are no pending requests', () => {
    hooks.list.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [], totalPages: 0 },
      refetch: hooks.retry,
    });

    renderPage();

    expect(
      screen.getByText('Tidak ada pengajuan perubahan harga yang menunggu persetujuan.')
    ).toBeInTheDocument();
  });

  it('retries after a queue load error', () => {
    hooks.list.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: hooks.retry,
    });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));

    expect(hooks.retry).toHaveBeenCalled();
  });

  it('requests the selected page', () => {
    hooks.list.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [request], totalPages: 2 },
      refetch: hooks.retry,
    });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(hooks.list).toHaveBeenLastCalledWith(
      { status: 'PENDING_APPROVAL', page: 2, limit: 100 },
      true
    );
  });

  it('hides decision controls without update permission', () => {
    hooks.access.mockReturnValue({
      isLoading: false,
      can: (_menu: string, action: string) => action !== 'update',
    });

    renderPage();

    expect(screen.queryByRole('button', { name: 'Approve aktif' })).not.toBeInTheDocument();
  });
});
