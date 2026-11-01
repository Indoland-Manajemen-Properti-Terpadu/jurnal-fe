import { useState } from 'react';
import { render, screen, userEvent } from '@test-utils';
import { emptyCountDraft, type CountDraft } from '@/module/petty-cash/domain/cashCount';
import type { ReplenishmentPreview } from '@/module/petty-cash/domain/pettyCashEntities';
import { CountSummary } from '@/module/petty-cash/presentation/components/CountSummary';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { DenominationCalculator } from '@/module/petty-cash/presentation/components/DenominationCalculator';
import {
  JournalDisclosure,
  PayoutSummary,
} from '@/module/petty-cash/presentation/components/JournalPreview';

function CalculatorHarness() {
  const [draft, setDraft] = useState<CountDraft>(emptyCountDraft());
  return <DenominationCalculator draft={draft} errorFor={() => undefined} onChange={setDraft} />;
}

describe('DenominationCalculator', () => {
  it('shows the subtotal of a row and the grand total as pieces are typed', async () => {
    render(<CalculatorHarness />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /Jumlah lembar atau keping Rp\s*100\.000/ }),
      '3'
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: /Jumlah lembar atau keping Rp\s*500$/ }),
      '4'
    );
    expect(screen.getAllByText(/Rp\s*300\.000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rp\s*2\.000/).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/Rp\s*302\.000/).length).toBeGreaterThan(0);
  });

  it('offers the seven banknotes and the four coins', () => {
    render(<CalculatorHarness />);
    expect(screen.getAllByRole('textbox')).toHaveLength(11);
  });
});

describe('CountSummary', () => {
  const setup = (type: 'SHORT' | 'OVER' | 'BALANCED', amount: number) => {
    const handlers = { onCancel: vi.fn(), onSaveDraft: vi.fn(), onSubmit: vi.fn() };
    render(
      <CountSummary
        counted={3289000}
        expected={3294000}
        variance={{ amount, type }}
        pending={false}
        showIssues={false}
        {...handlers}
      />
    );
    return handlers;
  };

  it.each([
    ['SHORT', -5000, /Kekurangan kas Rp\s*5\.000/],
    ['OVER', 5000, /Kelebihan kas Rp\s*5\.000/],
    ['BALANCED', 0, /Uang fisik sama dengan pembukuan/],
  ] as const)('says a %s count in words', (type, amount, text) => {
    setup(type, amount);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('marks the expected cash as an estimate and lets the count be submitted or saved', async () => {
    const { onSubmit, onSaveDraft } = setup('SHORT', -5000);
    expect(screen.getByText(/Perkiraan dari saldo saat ini/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ajukan opname' }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan draf' }));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSaveDraft).toHaveBeenCalled();
  });
});

describe('DecisionDialog', () => {
  it('shows an extra field and keeps confirm disabled until it is valid', async () => {
    const onConfirm = vi.fn();
    render(
      <DecisionDialog
        opened
        title="Cairkan"
        confirmLabel="Cairkan dana"
        confirmDisabled
        loading={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      >
        <span>Tanggal pencairan</span>
      </DecisionDialog>
    );
    expect(screen.getByText('Tanggal pencairan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cairkan dana' })).toBeDisabled();
  });
});

const preview: ReplenishmentPreview = {
  voucherTotal: 1306000,
  varianceAmount: -5000,
  varianceType: 'SHORT',
  totalAmount: 1311000,
  voucherCount: 4,
  countId: 'c1',
  expenseBreakdown: [{ accountId: 'a1', account: '6-10000 - Beban Operasional', amount: 1050000 }],
  taxBreakdown: [{ accountId: 'a2', account: '1-10407 - PPN Masukan', amount: 11000 }],
  journalPreview: [
    { account: '6-10000 - Beban Operasional', debit: 1050000, credit: 0 },
    { account: '1-10003 - Bank Mandiri', debit: 0, credit: 1311000 },
  ],
  isBalanced: true,
  cashAfterDisbursement: 4600000,
  warnings: [],
};

describe('replenishment preview', () => {
  it('shows what is paid out, the shortage that is refilled and the cash after', () => {
    render(<PayoutSummary preview={preview} />);
    expect(screen.getAllByText(/Rp\s*1\.311\.000/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Kekurangan kas ikut diganti/)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*4\.600\.000/)).toBeInTheDocument();
    expect(screen.getByText('Jurnal seimbang')).toBeInTheDocument();
  });

  it('warns, in plain words, when the journal is not balanced', () => {
    render(<PayoutSummary preview={{ ...preview, isBalanced: false }} />);
    expect(screen.getByText(/Jurnal belum seimbang/)).toBeInTheDocument();
  });

  it('keeps the journal lines behind a disclosure and shows debit and credit', async () => {
    render(<JournalDisclosure preview={preview} />);
    await userEvent.click(screen.getByText('Lihat jurnal yang akan dibukukan'));
    expect(await screen.findByText('1-10003 - Bank Mandiri')).toBeInTheDocument();
    expect(screen.getAllByText(/Rp\s*1\.311\.000/).length).toBeGreaterThan(0);
  });
});
