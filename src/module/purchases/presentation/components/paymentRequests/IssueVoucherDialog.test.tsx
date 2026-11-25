import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { ApiError } from '@/lib/http/apiError';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import { IssueVoucherDialog } from './IssueVoucherDialog';

const mutations = vi.hoisted(() => ({
  create: vi.fn(),
  byVendor: vi.fn(),
  createError: null as unknown,
}));
vi.mock('@/module/purchases/presentation/hooks/usePurchaseMutations', () => ({
  useCreatePayment: () => ({
    mutate: mutations.create,
    isPending: false,
    error: mutations.createError,
    reset: vi.fn(),
  }),
  useCreatePaymentsByVendor: () => ({
    mutate: mutations.byVendor,
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));
vi.mock('@/module/purchases/presentation/components/payments/DepositAccountField', () => ({
  DepositAccountField: () => <div />,
}));

const total = (vendorId: string, amount: number, voucher = false) => ({
  vendorId,
  vendorName: `Vendor ${vendorId}`,
  amount,
  billCount: 1,
  voucher: voucher ? { id: `pv-${vendorId}`, number: `PV/${vendorId}`, status: 'DRAFT' } : null,
});

const request = (overrides: Partial<PaymentRequest> = {}): PaymentRequest =>
  ({
    id: 'pp1',
    number: 'PP/2026/11/0006',
    kind: 'SETTLEMENT',
    amount: 300,
    dueDate: null,
    vendor: { id: 'v1', name: 'Vendor v1' },
    isMultiVendor: false,
    vendorTotals: [],
    items: [],
    order: null,
    ...overrides,
  }) as unknown as PaymentRequest;

const renderDialog = (doc: PaymentRequest) =>
  render(
    <MemoryRouter>
      <IssueVoucherDialog request={doc} opened onClose={vi.fn()} />
    </MemoryRouter>
  );

describe('IssueVoucherDialog with several vendors', () => {
  beforeEach(() => {
    mutations.create.mockReset();
    mutations.byVendor.mockReset();
    mutations.createError = null;
  });

  const several = request({
    isMultiVendor: true,
    vendorTotals: [total('v1', 100), total('v2', 200)],
  });

  it('offers one voucher per vendor, all at once, as the first choice', async () => {
    renderDialog(several);

    expect(await screen.findByLabelText(/Semua vendor sekaligus/)).toBeChecked();
    expect(screen.getByLabelText(/Hanya Vendor v1/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hanya Vendor v2/)).toBeInTheDocument();
  });

  it('issues all of them together through the by-vendor call', async () => {
    renderDialog(several);

    await userEvent.click(await screen.findByRole('button', { name: 'Terbitkan PV' }));

    expect(mutations.byVendor).toHaveBeenCalledTimes(1);
    expect(mutations.byVendor.mock.calls[0][0]).toMatchObject({ paymentRequests: ['pp1'] });
    expect(mutations.byVendor.mock.calls[0][0]).not.toHaveProperty('vendor');
    expect(mutations.create).not.toHaveBeenCalled();
  });

  it('issues one vendor alone with that vendor named', async () => {
    renderDialog(several);

    await userEvent.click(await screen.findByLabelText(/Hanya Vendor v2/));
    await userEvent.click(screen.getByRole('button', { name: 'Terbitkan PV' }));

    expect(mutations.create).toHaveBeenCalledTimes(1);
    expect(mutations.create.mock.calls[0][0]).toMatchObject({
      paymentRequests: ['pp1'],
      vendor: 'v2',
    });
    expect(mutations.byVendor).not.toHaveBeenCalled();
  });

  it('offers only the vendors without a voucher once one was issued', async () => {
    renderDialog(
      request({
        isMultiVendor: true,
        vendorTotals: [total('v1', 100, true), total('v2', 200)],
      })
    );

    expect(await screen.findByLabelText(/Hanya Vendor v2/)).toBeChecked();
    expect(screen.queryByLabelText(/Semua vendor sekaligus/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Hanya Vendor v1/)).not.toBeInTheDocument();
  });

  it('keeps the old single voucher for a request with one vendor', async () => {
    renderDialog(request());

    await userEvent.click(await screen.findByRole('button', { name: 'Terbitkan PV' }));

    expect(mutations.create).toHaveBeenCalledTimes(1);
    expect(mutations.create.mock.calls[0][0]).not.toHaveProperty('vendor');
    expect(screen.queryByLabelText(/Semua vendor sekaligus/)).not.toBeInTheDocument();
  });
});

describe('IssueVoucherDialog when the service refuses', () => {
  it("says why, in the service's own words, so the vendor can be fixed", async () => {
    mutations.createError = new ApiError({
      kind: 'validation',
      status: 400,
      validationMessage:
        'Payment voucher belum bisa diterbitkan (PT Geruite): Isi rekening bank vendor di data kontak',
    });

    renderDialog(request());

    expect(await screen.findByText(/Isi rekening bank vendor di data kontak/)).toBeInTheDocument();
    mutations.createError = null;
  });

  it('shows a plain sentence when the refusal has no message of its own', async () => {
    mutations.createError = new ApiError({ kind: 'unknown' });

    renderDialog(request());

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    mutations.createError = null;
  });
});
