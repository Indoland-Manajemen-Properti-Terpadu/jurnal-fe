import { render, screen, userEvent } from '@test-utils';
import { TransferLinesEditor } from './TransferLinesEditor';

const options = [
  { value: 'p1', label: 'Kertas A4', unit: 'rim', available: 50 },
  { value: 'p2', label: 'Map plastik', unit: 'pcs', available: 200 },
];

const setup = (overrides: Record<string, unknown> = {}) => {
  const onChange = vi.fn();
  render(
    <TransferLinesEditor
      lines={[{ product: 'p1', quantity: 5 }]}
      options={options}
      sourceChosen
      issues={{}}
      noLines={false}
      onChange={onChange}
      {...overrides}
    />
  );
  return onChange;
};

describe('TransferLinesEditor', () => {
  it('asks for the source warehouse first and does not let a product be added yet', () => {
    setup({ sourceChosen: false, lines: [] });

    expect(
      screen.getByText('Pilih gudang asal dulu supaya stok tersedianya bisa dihitung.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tambah produk' })).toBeDisabled();
  });

  it('says so when the source warehouse holds nothing on that date', () => {
    setup({ options: [], lines: [] });

    expect(screen.getByText('Gudang asal tidak punya stok pada tanggal ini.')).toBeInTheDocument();
  });

  it('shows what is available for the chosen product, with its unit', () => {
    setup();

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getAllByText('rim').length).toBeGreaterThan(0);
  });

  it('adds an empty row', async () => {
    const onChange = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Tambah produk' }));

    expect(onChange).toHaveBeenCalledWith([
      { product: 'p1', quantity: 5 },
      { product: '', quantity: 0 },
    ]);
  });

  it('removes a row', async () => {
    const onChange = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Hapus baris Kertas A4' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('names what is wrong with a row, with the available quantity', () => {
    setup({ issues: { 0: 'overAvailable' } });

    expect(screen.getByText('Melebihi stok tersedia (50 rim)')).toBeInTheDocument();
  });

  it('asks for at least one product when there is none', () => {
    setup({ lines: [], noLines: true });

    expect(screen.getByText('Tambahkan minimal satu produk')).toBeInTheDocument();
  });
});
