import { render, screen } from '@test-utils';
import {
  emptyPaymentRequestForm,
  type PaymentRequestErrors,
  type RequestableBill,
} from '@/module/purchases/domain/paymentRequest';
import { RequestableBillsEditor } from './RequestableBillsEditor';

const bill = (
  id: string,
  vendorId: string,
  vendorName: string,
  requestable = 100
): RequestableBill => ({
  id,
  number: `FKT/${id}`,
  vendorInvoiceNumber: `INV-${id}`,
  vendorId,
  vendorName,
  dueDate: '2026-12-01',
  requestable,
});

const noErrors = (overrides: Partial<PaymentRequestErrors> = {}): PaymentRequestErrors => ({
  bills: {},
  vendors: {},
  ...overrides,
});

const renderEditor = (
  props: Partial<Parameters<typeof RequestableBillsEditor>[0]> & {
    amounts?: Record<string, number>;
  } = {}
) => {
  const { amounts = {}, ...rest } = props;
  return render(
    <RequestableBillsEditor
      bills={[bill('b1', 'v1', 'PT Alfa'), bill('b2', 'v2', 'CV Mitra', 250)]}
      vendors={[
        { id: 'v1', name: 'PT Alfa' },
        { id: 'v2', name: 'CV Mitra' },
      ]}
      values={{ ...emptyPaymentRequestForm('SETTLEMENT', '2026-11-25'), amounts }}
      errors={noErrors()}
      showErrors={false}
      onChange={vi.fn()}
      {...rest}
    />
  );
};

describe('RequestableBillsEditor with several vendors', () => {
  it('groups the bills under the vendor they belong to', () => {
    renderEditor();

    expect(screen.getByText('PT Alfa')).toBeInTheDocument();
    expect(screen.getByText('CV Mitra')).toBeInTheDocument();
    expect(screen.getByText('FKT/b1')).toBeInTheDocument();
    expect(screen.getByText('FKT/b2')).toBeInTheDocument();
  });

  it('shows what is asked from each vendor once a bill of it is picked', () => {
    renderEditor({ amounts: { b2: 250 } });

    expect(screen.getByText(/Diminta dari vendor ini/)).toHaveTextContent(/250/);
  });

  it('draws no vendor header for a request with one vendor', () => {
    renderEditor({
      bills: [bill('b1', 'v1', 'PT Alfa')],
      vendors: [{ id: 'v1', name: 'PT Alfa' }],
    });

    expect(screen.queryByText('PT Alfa')).not.toBeInTheDocument();
    expect(screen.getByText('FKT/b1')).toBeInTheDocument();
  });

  it('says a chosen vendor still needs a bill', () => {
    renderEditor({
      amounts: { b1: 100 },
      showErrors: true,
      errors: noErrors({ vendors: { v2: 'noBillForVendor' } }),
    });

    expect(screen.getByText('Pilih minimal satu faktur untuk CV Mitra')).toBeInTheDocument();
  });

  it('keeps that note out of sight until the person has tried to go on', () => {
    renderEditor({
      amounts: { b1: 100 },
      errors: noErrors({ vendors: { v2: 'noBillForVendor' } }),
    });

    expect(screen.queryByText(/Pilih minimal satu faktur/)).not.toBeInTheDocument();
  });

  it('says a chosen vendor has no open bill to ask for', () => {
    renderEditor({
      bills: [bill('b1', 'v1', 'PT Alfa')],
    });

    expect(screen.getByText('Tidak ada faktur terbuka untuk vendor ini')).toBeInTheDocument();
  });
});
