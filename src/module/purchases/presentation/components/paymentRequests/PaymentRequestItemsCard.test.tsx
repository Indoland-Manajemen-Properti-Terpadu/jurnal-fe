import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import { PaymentRequestItemsCard } from './PaymentRequestDetailCards';

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
});
