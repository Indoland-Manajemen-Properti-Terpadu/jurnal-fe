import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import type { OrderRetention } from '@/module/purchases/domain/purchaseDocuments';
import { OrderRetentionCard } from './OrderRetentionCard';

const retention = (overrides: Partial<OrderRetention> = {}): OrderRetention => ({
  percent: 5,
  maintenanceMonths: 3,
  total: 100,
  held: 50,
  released: 0,
  balance: 50,
  state: 'HELD',
  maintenanceFrom: '2026-11-25',
  releasableFrom: '2027-02-25',
  ...overrides,
});

const renderCard = (value: OrderRetention, canRelease = true) =>
  render(
    <MemoryRouter>
      <OrderRetentionCard
        orderId="po1"
        retention={value}
        isService
        bills={[]}
        canRelease={canRelease}
      />
    </MemoryRouter>
  );

describe('OrderRetentionCard', () => {
  it('shows the percent, the four amounts and when it can be released', () => {
    renderCard(retention());

    expect(screen.getByText('Retensi 5%')).toBeInTheDocument();
    expect(screen.getByText('Total retensi')).toBeInTheDocument();
    expect(screen.getByText('Saldo Hutang Retensi')).toBeInTheDocument();
    expect(screen.getByText(/Dilepas 25 Feb 2027/)).toBeInTheDocument();
    expect(screen.queryByText('Kerjakan sekarang')).not.toBeInTheDocument();
  });

  it('offers to release once the maintenance period is over, to whoever may', () => {
    renderCard(retention({ state: 'RELEASABLE' }));

    expect(screen.getByText('Bisa dilepas')).toBeInTheDocument();
    expect(screen.getByText('Kerjakan sekarang')).toBeInTheDocument();
  });

  it('does not offer release without the right', () => {
    renderCard(retention({ state: 'RELEASABLE' }), false);

    expect(screen.queryByText('Kerjakan sekarang')).not.toBeInTheDocument();
  });

  it('waits for the last term when the maintenance period has not started', () => {
    renderCard(retention({ maintenanceFrom: null, releasableFrom: null }));

    expect(screen.getByText('Menunggu termin terakhir')).toBeInTheDocument();
  });

  it('says it is all released', () => {
    renderCard(retention({ state: 'RELEASED', released: 50, balance: 0 }));

    expect(screen.getByText('Retensi sudah dilepas seluruhnya.')).toBeInTheDocument();
  });
});
