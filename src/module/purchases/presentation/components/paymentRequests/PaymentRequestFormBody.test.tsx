import { MemoryRouter } from 'react-router-dom';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '@test-utils';
import { emptyPaymentRequestForm } from '@/module/purchases/domain/paymentRequest';
import { PaymentRequestFormBody } from './PaymentRequestFormBody';

const { create, createWithAttachments, update, upload, useOpenBillsOfVendors, useOrders } =
  vi.hoisted(() => ({
    create: vi.fn(),
    createWithAttachments: vi.fn(),
    update: vi.fn(),
    upload: vi.fn(),
    useOpenBillsOfVendors: vi.fn(),
    useOrders: vi.fn(),
  }));

vi.mock('@/module/purchases/presentation/hooks/usePurchaseMutations', () => ({
  useCreatePaymentRequest: () => ({ isPending: false, mutateAsync: create }),
  useCreatePaymentRequestWithAttachments: () => ({
    isPending: false,
    mutateAsync: createWithAttachments,
  }),
  useUpdatePaymentRequest: () => ({ isPending: false, mutateAsync: update }),
  useUploadAttachments: () => ({ isPending: false, mutateAsync: upload }),
}));

vi.mock('@/module/purchases/presentation/hooks/usePurchaseQueries', () => ({
  useOpenBillsOfVendors,
  useOrders,
}));

vi.mock(
  '@/module/purchases/presentation/components/paymentRequests/PaymentRequestAmountFields',
  () => ({
    PaymentRequestAmountFields: () => <div />,
  })
);

vi.mock(
  '@/module/purchases/presentation/components/paymentRequests/PaymentRequestProformaFiles',
  () => ({
    PaymentRequestProformaFiles: ({ onChange }: { onChange: (files: File[]) => void }) => (
      <button
        type="button"
        onClick={() =>
          onChange([new File(['proforma'], 'proforma.pdf', { type: 'application/pdf' })])
        }
      >
        Add proforma
      </button>
    ),
  })
);

vi.mock('@/module/purchases/presentation/components/shared/LookupSelects', () => ({
  SupplierSelect: () => <div />,
  SupplierMultiSelect: () => <div />,
}));

vi.mock('@/module/purchases/presentation/components/shared/FormFrame', () => ({
  FormFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('PaymentRequestFormBody', () => {
  beforeEach(() => {
    create.mockReset().mockResolvedValue({ id: 'request-1' });
    createWithAttachments.mockReset().mockResolvedValue({ id: 'request-1' });
    update.mockReset().mockResolvedValue({ id: 'request-1' });
    upload.mockReset().mockResolvedValue(undefined);
    useOpenBillsOfVendors.mockReturnValue({ items: [] });
    useOrders.mockReturnValue({
      data: {
        items: [
          {
            id: 'order-1',
            advance: { available: 250000 },
            advanceState: { mode: 'REQUEST', paid: false },
          },
        ],
      },
    });
  });

  it('creates a new DP with selected proforma files in one mutation', async () => {
    render(
      <MemoryRouter>
        <PaymentRequestFormBody
          initial={{
            ...emptyPaymentRequestForm('DP', '2026-11-27'),
            purchaseOrderId: 'order-1',
            advanceAmount: 120000,
          }}
          initialVendor={{ id: 'vendor-1', name: 'Vendor', npwp: null, paymentTermDays: null }}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lanjut' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add proforma' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Payment Request' }));

    expect(
      await screen.findByRole('button', { name: 'Simpan Payment Request' })
    ).toBeInTheDocument();
    expect(createWithAttachments).toHaveBeenCalledWith({
      input: expect.objectContaining({ kind: 'DP', purchaseOrder: 'order-1', amount: 120000 }),
      files: [expect.objectContaining({ name: 'proforma.pdf' })],
    });
    expect(create).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });
});
