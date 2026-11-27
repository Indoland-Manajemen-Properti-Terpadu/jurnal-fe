import { render, screen } from '@test-utils';
import type { PriceChangeRequest } from '@/module/purchases/domain/purchasePriceChanges';
import { PriceChangeApprovalCard } from './PriceChangeApprovalCard';

const request = (overrides: Partial<PriceChangeRequest> = {}): PriceChangeRequest => ({
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
  ...overrides,
});

describe('PriceChangeApprovalCard', () => {
  it('shows the request details and current approver', () => {
    render(
      <PriceChangeApprovalCard
        request={request()}
        canApprove={false}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText('Harga invoice vendor berbeda')).toBeInTheDocument();
    expect(screen.getByText('Meja rapat')).toBeInTheDocument();
    expect(screen.getAllByText('Chief Finance')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Setujui' })).not.toBeInTheDocument();
  });

  it('shows decision controls only when both permission and the active stage allow a decision', () => {
    const { rerender } = render(
      <PriceChangeApprovalCard
        request={request()}
        canApprove
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Setujui' })).toBeInTheDocument();

    rerender(
      <PriceChangeApprovalCard
        request={request({ canDecide: false })}
        canApprove
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: 'Setujui' })).not.toBeInTheDocument();
  });
});
