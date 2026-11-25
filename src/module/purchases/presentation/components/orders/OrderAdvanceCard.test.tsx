import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { OrderAdvanceState } from '@/module/purchases/domain/purchaseDocuments';
import { OrderAdvanceCard } from './OrderAdvanceCard';

const state = (overrides: Partial<OrderAdvanceState> = {}): OrderAdvanceState => ({
  mode: 'BILL',
  amount: 30000000,
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
  receiptBlockReason: 'FPB/BAPP baru bisa dicatat setelah faktur DP dibayar',
  bills: [],
  paymentRequests: [],
  paymentVouchers: [],
  ...overrides,
});

const renderCard = (advance: OrderAdvanceState) =>
  render(
    <MemoryRouter>
      <OrderAdvanceCard advance={advance} />
    </MemoryRouter>
  );

describe('OrderAdvanceCard', () => {
  it('shows the amount and the step the advance is at', () => {
    renderCard(state());

    expect(screen.getByText('Uang muka (DP)')).toBeInTheDocument();
    expect(screen.getByText(/30\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText('Catat faktur DP')).toBeInTheDocument();
  });

  it('says plainly that a document is not made yet', () => {
    renderCard(state());

    expect(screen.getByText('Faktur DP')).toBeInTheDocument();
    expect(screen.getAllByText('Belum ada')).toHaveLength(3);
  });

  it('links the documents that exist', () => {
    renderCard(
      state({
        bills: [{ id: 'b1', number: 'FKT/2026/11/0012', status: 'VERIFIED' }],
        paymentRequests: [{ id: 'r1', number: 'PR/2026/11/0001', status: 'APPROVED' }],
        paymentVouchers: [{ id: 'p1', number: 'PV/2026/11/0001', status: 'PAID' }],
      })
    );

    expect(screen.getByRole('link', { name: 'FKT/2026/11/0012' })).toHaveAttribute(
      'href',
      '/purchases/bills/b1'
    );
    expect(screen.getByRole('link', { name: 'PR/2026/11/0001' })).toHaveAttribute(
      'href',
      '/purchases/payment-requests/r1'
    );
    expect(screen.getByRole('link', { name: 'PV/2026/11/0001' })).toHaveAttribute(
      'href',
      '/purchases/payments/p1'
    );
    expect(screen.queryByText('Belum ada')).not.toBeInTheDocument();
  });

  it('says how much of the advance is left once it is booked', () => {
    renderCard(state({ postedAmount: 30000000, recognizedAmount: 7500000, heldAmount: 22500000 }));

    expect(screen.getByText(/Uang muka tersisa/)).toHaveTextContent(/22\.500\.000/);
    expect(screen.getByText(/Uang muka tersisa/)).toHaveTextContent(/30\.000\.000/);
  });

  it('gives no balance sentence before the advance is booked', () => {
    renderCard(state());

    expect(screen.queryByText(/Uang muka tersisa/)).not.toBeInTheDocument();
  });

  it('tells why a receipt waits while the advance is unpaid', () => {
    renderCard(state());

    expect(
      screen.getByText('FPB/BAPP baru bisa dicatat setelah faktur DP dibayar')
    ).toBeInTheDocument();
  });

  it('shows no waiting note once receipts are allowed', () => {
    renderCard(state({ receiptAllowed: true, receiptBlockReason: null }));

    expect(screen.queryByText(/baru bisa dicatat/)).not.toBeInTheDocument();
  });

  it('skips the bill row for an advance that goes only through a payment request', () => {
    renderCard(state({ mode: 'REQUEST', canCreateBill: false }));

    expect(screen.queryByText('Faktur DP')).not.toBeInTheDocument();
    expect(screen.getByText('Payment request DP')).toBeInTheDocument();
  });
});
