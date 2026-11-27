import { render, screen } from '@test-utils';
import { MemoryRouter } from 'react-router-dom';
import type { PriceChangeRequest } from '@/module/purchases/domain/purchasePriceChanges';
import { PriceChangeList } from './PriceChangeList';

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
  plan: [{ name: 'Chief Finance', mode: 'ANY', roles: [{ id: 'cf', name: 'Chief Finance' }] }],
  entries: [],
  pending: [
    {
      level: 0,
      name: 'Chief Finance',
      mode: 'ANY',
      roles: [{ id: 'cf', name: 'Chief Finance', approved: false }],
    },
  ],
  canDecide: true,
  rejectionReason: null,
  rejectedAt: null,
  approvalStage: 0,
};

describe('PriceChangeList', () => {
  it('shows the active stage, changed prices and an order detail link', () => {
    render(
      <MemoryRouter>
        <PriceChangeList requests={[request]} canDecide onApprove={vi.fn()} onReject={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'PO-001' })).toHaveAttribute(
      'href',
      '/purchases/orders/order-1'
    );
    expect(screen.getByText('Giliran Anda')).toBeInTheDocument();
    expect(screen.getByText(/Chief Finance/)).toBeInTheDocument();
    expect(screen.getByText('Meja rapat')).toBeInTheDocument();
    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
    expect(screen.getAllByText(/1\.100\.000/)).toHaveLength(2);
  });

  it('does not mark a request as ready for this user without permission', () => {
    render(
      <MemoryRouter>
        <PriceChangeList
          requests={[request]}
          canDecide={false}
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Menunggu persetujuan')).toBeInTheDocument();
    expect(screen.queryByText('Giliran Anda')).not.toBeInTheDocument();
  });

  it('shows approve and reject controls when the active stage allows a decision', () => {
    render(
      <MemoryRouter>
        <PriceChangeList requests={[request]} canDecide onApprove={vi.fn()} onReject={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Setujui' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tolak' })).toBeInTheDocument();
  });

  it('does not offer decisions when the active stage is unavailable', () => {
    render(
      <MemoryRouter>
        <PriceChangeList
          requests={[{ ...request, approvalStage: null, canDecide: false }]}
          canDecide
          onApprove={vi.fn()}
          onReject={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Setujui' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tolak' })).not.toBeInTheDocument();
  });
});
