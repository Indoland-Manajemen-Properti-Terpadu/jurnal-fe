import { useForm } from '@mantine/form';
import { render, screen, userEvent } from '@test-utils';
import type { NumberFormatTypeInfo } from '@/module/settings/domain/numberFormatTypes';
import { NumberFormatFormModal, type NumberFormatFormValues } from './NumberFormatFormModal';

const info = (overrides: Partial<NumberFormatTypeInfo>): NumberFormatTypeInfo => ({
  type: 'paymentRequest',
  label: 'Payment request',
  group: 'purchase',
  groupLabel: 'Pembelian',
  hasDefault: true,
  defaultPrefix: 'PR',
  defaultExample: 'PR/2026/11/0001',
  restartsEvery: 'MONTH',
  formatCount: 0,
  format: null,
  ...overrides,
});

const types: NumberFormatTypeInfo[] = [
  info({
    type: 'invoice',
    label: 'Faktur',
    group: 'general',
    groupLabel: 'Umum',
    hasDefault: false,
  }),
  info({}),
  info({
    type: 'bill',
    label: 'Faktur vendor',
    formatCount: 1,
    format: {
      id: 'f1',
      prefix: 'FKT-',
      suffix: '',
      status: 'active',
      startNumber: 1,
      currentNumber: 12,
      nextNumber: 'FKT-00012',
    },
  }),
  info({ type: 'stockTransfer', label: 'Pindah barang', group: 'stock', groupLabel: 'Stok' }),
];

const Harness = ({ initialType = '' }: { initialType?: string }) => {
  const form = useForm<NumberFormatFormValues>({
    initialValues: {
      type: initialType,
      prefix: 'PR-',
      suffix: '',
      startNumber: 1,
      status: 'active',
    },
  });
  return (
    <NumberFormatFormModal
      opened
      onClose={vi.fn()}
      isEditing={false}
      form={form}
      onSubmit={vi.fn()}
      isPending={false}
      types={types}
    />
  );
};

describe('NumberFormatFormModal, document types', () => {
  it('offers the types the service lists, grouped under their group names', async () => {
    render(<Harness />);

    await userEvent.click(await screen.findByRole('textbox', { name: /Jenis dokumen/ }));

    expect(await screen.findByText('Umum')).toBeInTheDocument();
    expect(screen.getByText('Pembelian')).toBeInTheDocument();
    expect(screen.getByText('Stok')).toBeInTheDocument();
    expect(screen.getByText('Pindah barang')).toBeInTheDocument();
  });

  it('tells a type with no default number that the site must set a format first', () => {
    render(<Harness initialType="invoice" />);

    expect(screen.getByText(/belum punya nomor bawaan/i)).toBeInTheDocument();
  });

  it('describes the default number, and that it starts again every month', () => {
    render(<Harness initialType="paymentRequest" />);

    expect(screen.getByText(/PR\/2026\/11\/0001/)).toBeInTheDocument();
    expect(screen.getByText(/mulai dari awal setiap bulan/i)).toBeInTheDocument();
  });

  it('says the site already has a format and shows its next number', () => {
    render(<Harness initialType="bill" />);

    expect(screen.getByText(/FKT-00012/)).toBeInTheDocument();
    expect(screen.getByText(/menggantikan nomor bawaan/i)).toBeInTheDocument();
  });

  it('warns that a format made here does not carry the year or month and does not restart', () => {
    render(<Harness initialType="paymentRequest" />);

    expect(screen.getByText(/tanpa tahun atau bulan/i)).toBeInTheDocument();
    expect(screen.getByText(/tidak mengulang tiap bulan/i)).toBeInTheDocument();
  });

  it('previews the number as prefix, five digits and suffix', () => {
    render(<Harness initialType="paymentRequest" />);

    expect(screen.getByText('PR-00001')).toBeInTheDocument();
  });
});
