import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@test-utils';
import type { OrderAdvanceState, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { OrderActionBar } from './OrderActionBar';

const mutations = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('@/module/purchases/presentation/hooks/usePurchaseAccess', () => ({
  usePurchaseAccess: () => ({ can: () => true, canRead: () => true, isLoading: false }),
}));
vi.mock('@/module/purchases/presentation/hooks/usePurchaseMutations', () => ({
  useCloseOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useVoidOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useSendOrder: () => ({ mutate: mutations.send, reset: vi.fn(), isPending: false }),
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
              status: 'WAITING_RECEIPT',
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
              vendor: { id: 'vendor1', name: 'PT Vendor Uji' },
              vendorEmails: [],
              sent: { byEmail: false, to: '', cc: [], note: '' },
              items: [{ billOnly: false, quantity: 10, receivedQty: 0, billedQty: 0 }],
            } as unknown as PurchaseOrder
          }
        />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('OrderActionBar and the advance', () => {
  it('does not offer receipt while the advance invoice is unpaid', () => {
    renderBar(advance());

    expect(screen.queryByRole('button', { name: 'Catat Penerimaan' })).not.toBeInTheDocument();
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

  it('resends an existing order by email instead of only marking it as sent', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <OrderActionBar
            order={
              {
                id: 'po1',
                number: 'PO/2026/11/0011',
                documentLabel: 'PO',
                status: 'WAITING_RECEIPT',
                withReceipt: true,
                billedAmount: 0,
                payableAmount: 100,
                advance: { available: 0 },
                advanceState: null,
                date: '2026-11-24',
                expectedDate: null,
                memo: '',
                deliveryAddress: '',
                warehouse: null,
                vendor: { id: 'vendor1', name: 'PT Vendor Uji' },
                vendorEmails: ['vendor@example.com'],
                sent: { byEmail: true, to: 'vendor@example.com', cc: [], note: '' },
                items: [{ billOnly: false, quantity: 10, receivedQty: 0, billedQty: 0 }],
              } as unknown as PurchaseOrder
            }
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Kirim ulang' }));

    expect(await screen.findByLabelText('Email tujuan')).toHaveValue('vendor@example.com');
    expect(screen.queryByText('Tandai sudah dikirim')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Email' }));

    expect(mutations.send).toHaveBeenCalledWith(
      { id: 'po1', input: { sendEmail: true, to: 'vendor@example.com' } },
      { onSuccess: expect.any(Function) }
    );
  });
});
