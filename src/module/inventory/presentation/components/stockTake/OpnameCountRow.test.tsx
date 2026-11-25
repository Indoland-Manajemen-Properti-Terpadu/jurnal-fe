import { Table } from '@mantine/core';
import { render, screen, userEvent, within } from '@test-utils';
import type { OpnameLine } from '@/module/inventory/domain/stockOpname';
import { OpnameCountRow } from './OpnameCountRow';

const line = (overrides: Partial<OpnameLine> = {}): OpnameLine => ({
  id: 'l1',
  productId: 'p1',
  name: 'Uji Kertas A4',
  sku: 'K-1',
  unit: 'rim',
  bookQty: 10,
  countedQty: null,
  diffQty: null,
  unitCost: 56800,
  costEditable: false,
  diffValue: null,
  reason: null,
  allowedReasons: [],
  note: '',
  isFound: false,
  needsRecount: false,
  ...overrides,
});

const renderRow = (props: Partial<Parameters<typeof OpnameCountRow>[0]> = {}) => {
  const onSave = vi.fn();
  render(
    <Table>
      <Table.Tbody>
        <OpnameCountRow line={line()} showValues canCount canReason onSave={onSave} {...props} />
      </Table.Tbody>
    </Table>
  );
  return { onSave };
};

describe('OpnameCountRow', () => {
  it('says a product is not counted yet, and leaves the field empty rather than 0', () => {
    renderRow();

    expect(screen.getByText('Belum dihitung')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Qty hitung Uji Kertas A4/ })).toHaveValue('');
  });

  it('saves the count as soon as the field is left', async () => {
    const { onSave } = renderRow();

    await userEvent.type(screen.getByRole('textbox', { name: /Qty hitung Uji Kertas A4/ }), '8');
    await userEvent.tab();

    expect(onSave).toHaveBeenCalledWith({ product: 'p1', countedQty: 8 });
  });

  it('does not save again when the count did not change', async () => {
    const { onSave } = renderRow({ line: line({ countedQty: 8, diffQty: -2 }) });

    await userEvent.click(screen.getByRole('textbox', { name: /Qty hitung Uji Kertas A4/ }));
    await userEvent.tab();

    expect(onSave).not.toHaveBeenCalled();
  });

  it('counts a zero as a count', async () => {
    const { onSave } = renderRow();

    await userEvent.type(screen.getByRole('textbox', { name: /Qty hitung Uji Kertas A4/ }), '0');
    await userEvent.tab();

    expect(onSave).toHaveBeenCalledWith({ product: 'p1', countedQty: 0 });
  });

  it('never sends a negative count: what the field shows is what is saved', async () => {
    const { onSave } = renderRow();
    const field = screen.getByRole('textbox', { name: /Qty hitung Uji Kertas A4/ });

    await userEvent.type(field, '-3');
    await userEvent.tab();

    for (const [change] of onSave.mock.calls) {
      expect(change.countedQty).toBeGreaterThanOrEqual(0);
    }
    expect(Number((field as HTMLInputElement).value)).toBeGreaterThanOrEqual(0);
    const saved = onSave.mock.calls.at(-1)?.[0].countedQty;
    expect(Number((field as HTMLInputElement).value)).toBe(saved);
  });

  it('draws neither book balance, difference nor price for a person who counts blind', () => {
    renderRow({
      showValues: false,
      canReason: false,
      line: line({ bookQty: null, unitCost: null }),
    });

    const row = screen.getByRole('row');
    expect(within(row).queryByText(/Rp/)).not.toBeInTheDocument();
    expect(within(row).queryByRole('textbox', { name: /Alasan/ })).not.toBeInTheDocument();
    expect(within(row).getByRole('textbox', { name: /Qty hitung/ })).toBeInTheDocument();
  });

  it('says a difference still needs a reason', () => {
    renderRow({ line: line({ countedQty: 8, diffQty: -2, diffValue: -113600 }) });

    expect(screen.getByText('Selisih, pilih alasan')).toBeInTheDocument();
  });

  it('says a note is missing when the reason is "Lainnya"', () => {
    renderRow({
      line: line({ countedQty: 8, diffQty: -2, reason: 'lainnya', allowedReasons: ['lainnya'] }),
    });

    expect(screen.getByText('Lengkapi catatan')).toBeInTheDocument();
  });

  it('cannot be edited by someone who may neither count nor give reasons', () => {
    renderRow({ canCount: false, canReason: false });

    expect(screen.getByRole('textbox', { name: /Qty hitung Uji Kertas A4/ })).toBeDisabled();
  });
});
