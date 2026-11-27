import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type {
  PaymentRequest,
  PaymentRequestVendorTotal,
} from '@/module/purchases/domain/paymentRequest';
import { PaymentRequestVendorsCard } from './PaymentRequestVendorsCard';

const totals: PaymentRequestVendorTotal[] = [
  {
    vendorId: 'v1',
    vendorName: 'PT Alfa Sejahtera',
    amount: 932400,
    billCount: 1,
    voucher: { id: 'pv1', number: 'PV/2026/11/0001', status: 'DRAFT' },
  },
  {
    vendorId: 'v2',
    vendorName: 'CV Mitra Teknik Lift',
    amount: 15980500,
    billCount: 3,
    voucher: null,
  },
];

const renderCard = (overrides: Partial<PaymentRequest> = {}) =>
  render(
    <MemoryRouter>
      <PaymentRequestVendorsCard
        doc={
          {
            isMultiVendor: true,
            status: 'APPROVED',
            vendorTotals: totals,
            ...overrides,
          } as PaymentRequest
        }
      />
    </MemoryRouter>
  );

describe('PaymentRequestVendorsCard', () => {
  it('lists each vendor with how many bills and how much is asked from it', () => {
    renderCard();

    expect(screen.getByText('PT Alfa Sejahtera')).toBeInTheDocument();
    expect(screen.getByText('CV Mitra Teknik Lift')).toBeInTheDocument();
    expect(screen.getByText('1 faktur')).toBeInTheDocument();
    expect(screen.getByText('3 faktur')).toBeInTheDocument();
    expect(screen.getByText(/932\.400/)).toBeInTheDocument();
    expect(screen.getByText(/15\.980\.500/)).toBeInTheDocument();
  });

  it('links the voucher a vendor got and says plainly that another has none yet', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'PV/2026/11/0001' })).toHaveAttribute(
      'href',
      '/purchases/payments/pv1'
    );
    expect(screen.getByText('Belum ada voucher')).toBeInTheDocument();
  });

  it('shows nothing for a request with a single vendor', () => {
    renderCard({ isMultiVendor: false });

    expect(screen.queryByText('Vendor dan voucher')).not.toBeInTheDocument();
  });

  it('hides each vendor amount while approval is still pending', () => {
    renderCard({ status: 'PENDING_APPROVAL' });

    expect(screen.queryByText(/932\.400/)).not.toBeInTheDocument();
    expect(screen.queryByText(/15\.980\.500/)).not.toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
