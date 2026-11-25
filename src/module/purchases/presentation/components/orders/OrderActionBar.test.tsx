import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { OrderAdvanceState, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { OrderActionBar } from './OrderActionBar';

vi.mock('@/module/purchases/presentation/hooks/usePurchaseAccess', () => ({
  usePurchaseAccess: () => ({ can: () => true, canRead: () => true, isLoading: false }),
}));
vi.mock('@/module/purchases/presentation/hooks/usePurchaseMutations', () => ({
  useCloseOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useVoidOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useSendOrder: () => ({ mutate: vi.fn(), isPending: false }),
}));

const advance = (overrides: Partial<OrderAdvanceState> = {}): OrderAdvanceState => ({
  mode: 'BILL',
  amount: 100,
  paidAmount: 0,
  billed: false,
  paid: false,
  postedAmount: 0,
  recognizedAmount: 0,
  heldAmount: 0,
  step: 'CREATE_BILL',
  stepLabel: 'Catat faktur DP',
  canCreateBill: true,
  receiptAllowed: false,
  receiptBlockReason: 'Bayar faktur DP dulu',
  bills: [],
  paymentRequests: [],
  paymentVouchers: [],
  ...overrides,
});

const renderBar = (state: OrderAdvanceState | null) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <OrderActionBar
          order={
            {
              id: 'po1',
              number: 'SPK/2026/11/0005',
              documentLabel: 'SPK',
              status: 'SENT',
              withReceipt: true,
              billedAmount: 0,
              payableAmount: 100,
              advance: { available: 0 },
              advanceState: state,
              date: '2026-11-24',
              expectedDate: null,
              memo: '',
              deliveryAddress: '',
              warehouse: null,
              vendorEmails: [],
              sent: { byEmail: false, to: '', cc: [], note: '' },
              items: [{ receivedQty: 0, billedQty: 0 }],
            } as unknown as PurchaseOrder
          }
        />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('OrderActionBar and the advance', () => {
  it('holds the receipt button back while the advance invoice is unpaid', () => {
    renderBar(advance());

    expect(screen.getByRole('button', { name: 'Catat Penerimaan' })).toBeDisabled();
  });

  it('lets a receipt be recorded once the advance allows it', () => {
    renderBar(advance({ receiptAllowed: true, receiptBlockReason: null }));

    expect(screen.getByRole('button', { name: 'Catat Penerimaan' })).toBeEnabled();
  });

  it('lets a receipt be recorded for an order with no advance', () => {
    renderBar(null);

    expect(screen.getByRole('button', { name: 'Catat Penerimaan' })).toBeEnabled();
  });

  it('offers "Catat faktur DP" only while the service says the advance bill can be made', () => {
    const { unmount } = renderBar(advance());
    expect(screen.getByRole('button', { name: 'Catat Faktur DP' })).toBeInTheDocument();
    unmount();

    renderBar(advance({ canCreateBill: false }));
    expect(screen.queryByRole('button', { name: 'Catat Faktur DP' })).not.toBeInTheDocument();
  });
});
