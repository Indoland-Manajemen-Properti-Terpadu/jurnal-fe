import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import {
  PaymentRequestInfoCard,
  PaymentRequestItemsCard,
  PaymentRequestSummaryCard,
  PaymentRequestVoucherCard,
} from './PaymentRequestDetailCards';

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

  it('matches the payment basis layout for an advance and shows its PO term', () => {
    render(
      <MemoryRouter>
        <PaymentRequestItemsCard
          doc={doc({
            kind: 'DP',
            order: { id: 'po1', number: 'PO/1', isService: false, total: 1000, status: 'APPROVED' },
          })}
          paymentTermName="DP + pelunasan 30% · jatuh tempo saat penerimaan"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Dasar pembayaran')).toBeInTheDocument();
    expect(
      screen.getByText('DP + pelunasan 30% · jatuh tempo saat penerimaan')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Batalkan DP melalui detail PO\/SPK/)).not.toBeInTheDocument();
  });

  it('uses allocation and remaining-balance columns for settlement bills', () => {
    renderCard(
      doc({
        items: [{ bill: { ...bill('b1'), remainingAmount: 0 }, amount: 300, vendorId: 'v1' }],
      })
    );

    expect(screen.getByRole('columnheader', { name: 'Dialokasikan' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Sisa Hutang' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nomor' })).toBeInTheDocument();
    const cells = screen.getAllByRole('row')[1].querySelectorAll('td');
    expect(cells[0]).toHaveTextContent('FKT/b1');
    expect(cells[3]).toHaveTextContent('300');
    expect(cells[4]).toHaveTextContent('0');
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
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('hides the summary total while approval is pending', () => {
    render(
      <MemoryRouter>
        <PaymentRequestSummaryCard doc={doc({ status: 'PENDING_APPROVAL' })} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.queryByText(/300,00/)).not.toBeInTheDocument();
  });
});

describe('PaymentRequestInfoCard', () => {
  it('shows the vendor bank and linked PO without repeating the voucher number', () => {
    render(
      <MemoryRouter>
        <PaymentRequestInfoCard
          doc={doc({
            kind: 'DP',
            kindLabel: 'Di muka',
            status: 'APPROVED',
            vendor: { id: 'v1', name: 'CV Mitra Teknik Lift', paymentTermDays: 30, npwp: null },
          })}
          vendorBankLabel="BNI 0456-7890-12 a.n. CV Mitra Teknik Lift"
          relatedOrders={[{ id: 'po1', number: 'PO/1' }]}
          paymentTermName="DP + pelunasan 30% · jatuh tempo saat penerimaan"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('BNI 0456-7890-12 a.n. CV Mitra Teknik Lift')).toBeInTheDocument();
    expect(screen.getByText('Vendor, jenis, dan rekening tujuan')).toBeInTheDocument();
    expect(screen.getByText(/Di muka · DP \+ pelunasan 30%/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PO/1' })).toHaveAttribute(
      'href',
      '/purchases/orders/po1'
    );
    expect(screen.getByText('Jenis pembayaran')).toBeInTheDocument();
    expect(screen.queryByText('Payment Voucher')).not.toBeInTheDocument();
  });
});

describe('PaymentRequestSummaryCard', () => {
  it('shows the vendor destination account after the request is approved', () => {
    render(
      <MemoryRouter>
        <PaymentRequestSummaryCard
          doc={doc({ status: 'APPROVED' })}
          vendorBankLabel="BNI 0456-7890-12 a.n. CV Mitra Teknik Lift"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Rekening tujuan')).toBeInTheDocument();
    expect(screen.getByText('BNI 0456-7890-12 a.n. CV Mitra Teknik Lift')).toBeInTheDocument();
  });
});

describe('PaymentRequestVoucherCard', () => {
  it('shows the issued voucher and its paid amount', () => {
    render(
      <MemoryRouter>
        <PaymentRequestVoucherCard
          doc={doc({
            status: 'PAID',
            vendor: {
              id: 'v1',
              name: 'CV Mitra Teknik Lift',
              paymentTermDays: 30,
              npwp: null,
            },
            voucher: {
              id: 'pv1',
              number: 'PV/2026/09/0004',
              status: 'PAID',
              totalAmount: 7326000,
              paidAt: '2026-09-25T10:00:00Z',
            },
          })}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'PV/2026/09/0004' })).toHaveAttribute(
      'href',
      '/purchases/payments/pv1'
    );
    expect(screen.getByText('CV Mitra Teknik Lift')).toBeInTheDocument();
    expect(screen.getByText(/7\.326\.000/)).toBeInTheDocument();
  });

  it('shows the prototype empty state before Finance issues a voucher', () => {
    render(
      <MemoryRouter>
        <PaymentRequestVoucherCard doc={doc({ voucher: null })} />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Belum terbit. Finance menerbitkan PV dari PR yang sudah disetujui ini.')
    ).toBeInTheDocument();
  });

  it('hides the voucher amount until the payment request approvals are complete', () => {
    render(
      <MemoryRouter>
        <PaymentRequestVoucherCard
          doc={doc({
            status: 'PENDING_APPROVAL',
            voucher: {
              id: 'pv1',
              number: 'PV/1',
              status: 'DRAFT',
              totalAmount: 7326000,
              paidAt: null,
            },
          })}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText(/7\.326\.000/)).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
