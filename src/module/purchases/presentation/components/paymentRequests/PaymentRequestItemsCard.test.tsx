import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import { PaymentRequestItemsCard, PaymentRequestSummaryCard } from './PaymentRequestDetailCards';

const bill = (id: string) => ({
  id,
  number: `FKT/${id}`,
  vendorInvoiceNumber: '',
  dueDate: null,
  finalAmount: 100,
  remainingAmount: 100,
  status: 'VERIFIED',
});

const doc = (overrides: Partial<PaymentRequest>): PaymentRequest =>
  ({
    kind: 'SETTLEMENT',
    status: 'APPROVED',
    amount: 300,
    isMultiVendor: false,
    vendorTotals: [],
    advanceAppliedAmount: 0,
    items: [
      { bill: bill('b1'), amount: 100, vendorId: 'v1' },
      { bill: bill('b2'), amount: 200, vendorId: 'v2' },
    ],
    ...overrides,
  }) as unknown as PaymentRequest;

const totals = [
  { vendorId: 'v1', vendorName: 'PT Alfa', amount: 100, billCount: 1, voucher: null },
  { vendorId: 'v2', vendorName: 'CV Mitra', amount: 200, billCount: 1, voucher: null },
];

const renderCard = (value: PaymentRequest) =>
  render(
    <MemoryRouter>
      <PaymentRequestItemsCard doc={value} />
    </MemoryRouter>
  );

describe('PaymentRequestItemsCard', () => {
  it('adds a Vendor column that names the vendor of each bill when there are several', () => {
    renderCard(doc({ isMultiVendor: true, vendorTotals: totals }));

    expect(screen.getByRole('columnheader', { name: 'Vendor' })).toBeInTheDocument();
    expect(screen.getByText('PT Alfa')).toBeInTheDocument();
    expect(screen.getByText('CV Mitra')).toBeInTheDocument();
  });

  it('has no Vendor column for a request with one vendor', () => {
    renderCard(doc({}));

    expect(screen.queryByRole('columnheader', { name: 'Vendor' })).not.toBeInTheDocument();
  });

  it('explains why an advance cannot be cancelled after billing or payment', () => {
    renderCard(doc({ kind: 'DP' }));

    expect(
      screen.getByText(
        'Batalkan DP melalui detail PO/SPK. Pembatalan ditolak jika PO/SPK pernah difakturkan atau DP pernah dibayar.'
      )
    ).toBeInTheDocument();
  });

  it('hides settlement and bill amounts until every approval is complete', () => {
    renderCard(doc({ status: 'PENDING_APPROVAL' }));

    expect(screen.queryByText(/100,00/)).not.toBeInTheDocument();
    expect(screen.queryByText(/200,00/)).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(4);
  });

  it('hides the DP amount and ratio while approval is pending', () => {
    renderCard(
      doc({
        kind: 'DP',
        status: 'PENDING_APPROVAL',
        order: { id: 'po1', number: 'PO/1', isService: false, total: 1000, status: 'APPROVED' },
      })
    );

    expect(screen.queryByText(/30%/)).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('hides the summary total while approval is pending', () => {
    render(
      <MemoryRouter>
        <PaymentRequestSummaryCard doc={doc({ status: 'PENDING_APPROVAL' })} />
      </MemoryRouter>
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/300,00/)).not.toBeInTheDocument();
  });
});
