import { MemoryRouter } from 'react-router-dom';
import { act, fireEvent, within } from '@testing-library/react';
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

    expect(screen.getByText(/Belum dikompensasi/)).toHaveTextContent(/22\.500\.000/);
    expect(screen.getByText(/Belum dikompensasi/)).toHaveTextContent(/30\.000\.000/);
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

  it('shows every request and offers cancellation only for an eligible unpaid DP', () => {
    render(
      <MemoryRouter>
        <OrderAdvanceCard
          advance={state({
            mode: 'REQUEST',
            paymentRequests: [
              { id: 'r1', number: 'PR/1', status: 'APPROVED' },
              { id: 'r2', number: 'PR/2', status: 'PAID' },
              { id: 'r3', number: 'PR/3', status: 'CANCELLED' },
            ],
          })}
          orderId="po1"
          canCancelAdvance
          onCancelAdvance={() => Promise.resolve()}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'PR/1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PR/2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PR/3' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Batalkan DP' })).toHaveLength(1);
  });

  it('hides DP cancellation without permission or when the order has bill history', () => {
    const advance = state({
      mode: 'REQUEST',
      paymentRequests: [{ id: 'r1', number: 'PR/1', status: 'APPROVED' }],
    });
    const { rerender } = render(
      <MemoryRouter>
        <OrderAdvanceCard
          advance={advance}
          orderId="po1"
          canCancelAdvance={false}
          canCancelAdvancePermission={false}
          onCancelAdvance={() => Promise.resolve()}
        />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: 'Batalkan DP' })).not.toBeInTheDocument();
    expect(screen.getByText(/tidak memiliki akses untuk membatalkan DP/i)).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <OrderAdvanceCard
          advance={{
            ...advance,
            bills: [{ id: 'bill-1', number: 'B/1', status: 'VOID' }],
          }}
          orderId="po1"
          canCancelAdvance
          canCancelAdvancePermission
          onCancelAdvance={() => Promise.resolve()}
        />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: 'Batalkan DP' })).not.toBeInTheDocument();
  });

  it('shows DP cancellation when billed is the default flag and there is no bill history', () => {
    render(
      <MemoryRouter>
        <OrderAdvanceCard
          advance={state({
            mode: 'REQUEST',
            billed: true,
            paymentRequests: [{ id: 'r1', number: 'PR/1', status: 'DRAFT' }],
          })}
          orderId="po1"
          canCancelAdvance
          onCancelAdvance={() => Promise.resolve()}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Batalkan DP' })).toBeInTheDocument();
  });

  it('requires a nonblank reason and trims it before cancelling', async () => {
    const onCancelAdvance = vi.fn().mockResolvedValue({});
    render(
      <MemoryRouter>
        <OrderAdvanceCard
          advance={state({
            mode: 'REQUEST',
            paymentRequests: [{ id: 'r1', number: 'PR/1', status: 'APPROVED' }],
          })}
          orderId="po1"
          canCancelAdvance
          onCancelAdvance={onCancelAdvance}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Batalkan DP' }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Batalkan DP' });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Alasan pembatalan' }), {
      target: { value: '  x  ' },
    });
    expect(confirm).toBeEnabled();
    await act(async () => {
      fireEvent.click(confirm as HTMLButtonElement);
      await Promise.resolve();
    });

    expect(onCancelAdvance).toHaveBeenCalledWith('r1', 'x');
  });
});
