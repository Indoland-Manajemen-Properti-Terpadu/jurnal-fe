import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import { toGoodsReceipt } from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import type { GoodsReceiptDto } from '@/module/purchases/infrastructure/purchaseDto';
import { ReceiptSummaryCard } from './ReceiptSummaryCard';

const receipt = (status: string) =>
  toGoodsReceipt({
    id: 'r1',
    kind: 'SERVICE',
    documentLabel: 'BAPP',
    status,
    vendor: { id: 'v1', displayName: 'Vendor' },
    purchaseOrder: 'po1',
    amount: 24975000,
    items: [
      {
        _id: 'i1',
        purchaseOrderItem: 'oi1',
        description: 'Jasa renovasi',
        receivedQty: 1,
        accrualAmount: 24975000,
      },
    ],
  } as unknown as GoodsReceiptDto);

describe('ReceiptSummaryCard', () => {
  it('hides BAPP amounts until final approval', () => {
    render(
      <MemoryRouter>
        <ReceiptSummaryCard
          receipt={receipt('PENDING_APPROVAL')}
          section="lines"
          orderSchedules={{ oi1: { kind: 'TERM', seq: 1, of: 3 } }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Jasa renovasi')).toBeInTheDocument();
    expect(screen.getByText('Termin 1 dari 3')).toBeInTheDocument();
    expect(screen.queryByText(/24\.975\.000/)).not.toBeInTheDocument();
  });

  it('shows BAPP amounts after posting', () => {
    render(
      <MemoryRouter>
        <ReceiptSummaryCard receipt={receipt('POSTED')} section="lines" />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/24\.975\.000/).length).toBeGreaterThan(0);
  });

  it('keeps the posted amount visible after voiding for audit', () => {
    render(
      <MemoryRouter>
        <ReceiptSummaryCard receipt={receipt('VOID')} section="lines" />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/24\.975\.000/).length).toBeGreaterThan(0);
  });
});
