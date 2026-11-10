import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { BalanceSheetAccountTable } from '../balance-sheet/BalanceSheetAccountTable';
import { ReportDotMatrix } from './ReportDotMatrix';
import { ReportKpiStrip } from './ReportKpiStrip';
import { ReportMiniBars } from './ReportMiniBars';
import { ReportRing } from './ReportRing';
import { ReportStatus } from './ReportStatus';
import { ReportToolbar } from './ReportToolbar';
import { ReportUnavailable } from './ReportUnavailable';

describe('ReportKpiStrip', () => {
  it('shows the period, the badges and every figure with its hint', () => {
    render(
      <ReportKpiStrip
        caption="Posisi per"
        period="05/11/2026"
        status={<span>Seimbang</span>}
        items={[
          { key: 'a', label: 'Total Aset', value: 'Rp 100', hint: 'Aset lancar' },
          { key: 'b', label: 'Total Liabilitas', value: 'Rp 40' },
        ]}
      />
    );
    expect(screen.getByText('05/11/2026')).toBeInTheDocument();
    expect(screen.getByText('Seimbang')).toBeInTheDocument();
    expect(screen.getByText('Rp 100')).toBeInTheDocument();
    expect(screen.getByText('Aset lancar')).toBeInTheDocument();
    expect(screen.getByText('Total Liabilitas')).toBeInTheDocument();
  });
});

describe('ReportUnavailable', () => {
  it('says the report is not available, offers a retry and a way back', async () => {
    const onRetry = vi.fn();
    render(
      <MemoryRouter>
        <ReportUnavailable onRetry={onRetry} />
      </MemoryRouter>
    );
    expect(screen.getByText('Laporan ini belum tersedia')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke Pusat Laporan' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Coba Lagi' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('has no retry button when there is nothing to retry', () => {
    render(
      <MemoryRouter>
        <ReportUnavailable />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: 'Coba Lagi' })).not.toBeInTheDocument();
  });
});

describe('BalanceSheetAccountTable', () => {
  const accounts = [
    {
      accountId: '1',
      accountNumber: '1-10000',
      accountName: 'Kas',
      categoryId: null,
      categoryName: 'Kas & Bank',
      balance: 600000,
    },
    {
      accountId: '2',
      accountNumber: '1-10003',
      accountName: 'Bank',
      categoryId: null,
      categoryName: null,
      balance: -13762000,
    },
  ];

  it('shows the subtotal in the header and negative balances in parentheses', () => {
    render(<BalanceSheetAccountTable title="Aset Lancar" accounts={accounts} subtotal={-100} />);
    expect(screen.getByText('Kas')).toBeInTheDocument();
    expect(screen.getByText(/\(Rp\s?13\.762\.000\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(Rp\s?100\)/)).toBeInTheDocument();
  });

  it('collapses the accounts but keeps the subtotal visible', async () => {
    render(<BalanceSheetAccountTable title="Aset Lancar" accounts={accounts} subtotal={500} />);
    const header = screen.getByRole('button', { name: 'Aset Lancar' });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/Rp\s?500/)).toBeInTheDocument();
  });
});

describe('ReportStatus and ReportRing', () => {
  it('shows a status as plain text', () => {
    render(<ReportStatus tone="ok" label="Seimbang" />);
    expect(screen.getByText('Seimbang')).toBeInTheDocument();
  });

  it('shows the figure in the middle of the ring', () => {
    render(<ReportRing value={100} label="100%" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows the cards of the strip with an optional visual and a footer card', () => {
    render(
      <ReportKpiStrip
        caption="Periode"
        period="01/11/2026"
        items={[{ key: 'a', label: 'Selisih', value: 'Rp 0', visual: <span>cincin</span> }]}
        footer={{ title: 'Perbandingan', content: <span>isi</span> }}
      />
    );
    expect(screen.getByText('cincin')).toBeInTheDocument();
    expect(screen.getByText('Perbandingan')).toBeInTheDocument();
    expect(screen.getByText('isi')).toBeInTheDocument();
  });
});

describe('ReportToolbar export', () => {
  const props = {
    preset: 'this_month' as const,
    onPresetChange: vi.fn(),
    draftPeriod: { startDate: '2026-11-01', endDate: '2026-11-05' },
    onDraftPeriodChange: vi.fn(),
    appliedPeriod: { startDate: '2026-11-01', endDate: '2026-11-05' },
    onApplyPeriod: vi.fn(),
    isFetching: false,
    onExport: vi.fn(),
    hasData: true,
  };

  it('offers a cancel button only while an export is running', async () => {
    const onCancelExport = vi.fn();
    const { rerender } = render(
      <ReportToolbar {...props} isExporting={false} onCancelExport={onCancelExport} />
    );
    expect(screen.queryByRole('button', { name: 'Batalkan' })).not.toBeInTheDocument();

    rerender(<ReportToolbar {...props} isExporting onCancelExport={onCancelExport} />);
    await userEvent.click(screen.getByRole('button', { name: 'Batalkan' }));
    expect(onCancelExport).toHaveBeenCalledOnce();
  });
});

describe('ReportToolbar period', () => {
  const props = {
    preset: 'custom' as const,
    onPresetChange: vi.fn(),
    draftPeriod: { startDate: '2026-11-01', endDate: '2026-11-05' },
    onDraftPeriodChange: vi.fn(),
    appliedPeriod: { startDate: '2026-11-01', endDate: '2026-11-05' },
    onApplyPeriod: vi.fn(),
    isFetching: false,
    hasData: true,
  };

  it('shows the Apply button only while the dates differ from the shown report', async () => {
    const onApplyPeriod = vi.fn();
    const { rerender } = render(<ReportToolbar {...props} onApplyPeriod={onApplyPeriod} />);
    expect(screen.queryByRole('button', { name: 'Terapkan' })).not.toBeInTheDocument();

    rerender(
      <ReportToolbar
        {...props}
        onApplyPeriod={onApplyPeriod}
        draftPeriod={{ startDate: '2026-11-01', endDate: '2026-11-09' }}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan' }));
    expect(onApplyPeriod).toHaveBeenCalledOnce();
  });

  it('hides the export menu for a report with no export, and shows refresh when given', async () => {
    const onRefresh = vi.fn();
    const { rerender } = render(<ReportToolbar {...props} />);
    expect(screen.queryByRole('button', { name: 'Ekspor' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Segarkan' })).not.toBeInTheDocument();

    rerender(<ReportToolbar {...props} onExport={vi.fn()} onRefresh={onRefresh} />);
    expect(screen.getByRole('button', { name: 'Ekspor' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Segarkan' }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});

describe('card visuals', () => {
  it('draws one dot per item and names how many are filled', () => {
    render(<ReportDotMatrix active={3} total={8} label="3 dari 8 akun" />);
    const matrix = screen.getByRole('img', { name: '3 dari 8 akun' });
    expect(matrix.children).toHaveLength(8);
  });

  it('draws one bar per value, at most 24', () => {
    render(<ReportMiniBars values={[1, 2, 3]} label="Debit per hari" />);
    expect(screen.getByRole('img', { name: 'Debit per hari' }).children).toHaveLength(3);

    render(<ReportMiniBars values={Array.from({ length: 40 }, (_, i) => i)} label="Banyak" />);
    expect(screen.getByRole('img', { name: 'Banyak' }).children).toHaveLength(24);
  });

  it('copes with a period without movement', () => {
    render(<ReportMiniBars values={[0, 0]} label="Kosong" />);
    expect(screen.getByRole('img', { name: 'Kosong' }).children).toHaveLength(2);
  });
});
