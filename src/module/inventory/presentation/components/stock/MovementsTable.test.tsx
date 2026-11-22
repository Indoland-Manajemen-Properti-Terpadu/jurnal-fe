import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent, within } from '@test-utils';
import type { StockMovement } from '@/module/inventory/domain/stockMovement';
import { MovementsTable } from './MovementsTable';

const move = (overrides: Partial<StockMovement> = {}): StockMovement => ({
  id: 'm1',
  date: '2026-11-22T00:00:00.000Z',
  type: 'RECEIPT',
  typeLabel: 'Penerimaan barang',
  isReversal: false,
  documentNumber: 'FPB/2026/11/0004',
  sourceType: 'GoodsReceipt',
  sourceId: 'r1',
  productId: 'p1',
  productName: 'Map plastik',
  sku: 'SKU-2',
  unit: 'pcs',
  warehouse: { id: 'a', code: 'GDG-001', name: 'Gudang Utama' },
  quantityIn: 100,
  quantityOut: 0,
  unitCost: 3850,
  value: 385000,
  journalId: 'j1',
  costBreakdown: null,
  ...overrides,
});

const renderTable = (rows: StockMovement[], showValue = true) =>
  render(
    <MemoryRouter>
      <MovementsTable rows={rows} showValue={showValue} />
    </MemoryRouter>
  );

describe('MovementsTable', () => {
  it('links the document number to the receipt it came from', () => {
    renderTable([move()]);

    expect(screen.getByRole('link', { name: 'FPB/2026/11/0004' })).toHaveAttribute(
      'href',
      '/purchases/receipts/r1'
    );
  });

  it('links a transfer movement to the transfer', () => {
    renderTable([
      move({
        sourceType: 'StockTransfer',
        sourceId: 't1',
        documentNumber: 'PDH/2026/11/0001',
        type: 'TRANSFER_OUT',
        typeLabel: 'Pindah keluar',
        journalId: null,
      }),
    ]);

    expect(screen.getByRole('link', { name: 'PDH/2026/11/0001' })).toHaveAttribute(
      'href',
      '/inventory/stock-movements/transfers/t1'
    );
  });

  it('links a stock count document to its page', () => {
    renderTable([
      move({ sourceType: 'StockOpname', sourceId: 'o1', documentNumber: 'SO/2026/11/0003' }),
    ]);

    expect(screen.getByRole('link', { name: 'SO/2026/11/0003' })).toHaveAttribute(
      'href',
      '/inventory/stock-take/o1'
    );
  });

  it('links to the journal when there is one and marks "Tanpa jurnal" with a dash when there is none', () => {
    renderTable([move(), move({ id: 'm2', journalId: null, documentNumber: 'PDH/1' })]);

    expect(screen.getByRole('link', { name: 'Lihat jurnal' })).toHaveAttribute(
      'href',
      '/general-journal/detail-transaction-journal/j1'
    );
    expect(screen.getByLabelText('Tanpa jurnal')).toHaveTextContent('—');
  });

  it('shows a reversal by its label and puts the quantity on the side it moved', () => {
    renderTable([
      move({
        type: 'REVERSAL',
        typeLabel: 'Pembatalan',
        isReversal: true,
        quantityIn: 0,
        quantityOut: 3,
        journalId: null,
      }),
    ]);
    const row = within(screen.getByText('Pembatalan').closest('tr') as HTMLElement);

    expect(row.getAllByText('—').length).toBeGreaterThan(0);
    expect(row.getByText('3')).toBeInTheDocument();
  });

  it('explains a price that carries freight or tax, and only then', async () => {
    renderTable([
      move({ costBreakdown: { dpp: 3500, freight: 350, vat: 0 } }),
      move({ id: 'm2', documentNumber: 'FPB/2', costBreakdown: { dpp: 3500, freight: 0, vat: 0 } }),
    ]);
    const priced = within(screen.getAllByRole('row')[1]);

    await userEvent.hover(priced.getByText(/3\.850/));

    expect(
      await screen.findByText(/DPP Rp\s3\.500,00 \+ ongkir Rp\s350,00/, undefined, {
        timeout: 3000,
      })
    ).toBeInTheDocument();
  });

  it('hides the price columns when the service sends no values', () => {
    renderTable([move({ unitCost: null, value: null })], false);

    expect(screen.queryByText('Harga satuan')).not.toBeInTheDocument();
    expect(screen.queryByText('Nilai')).not.toBeInTheDocument();
  });
});
