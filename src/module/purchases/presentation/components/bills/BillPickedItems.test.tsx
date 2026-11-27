import { render, screen, userEvent } from '@test-utils';
import { estimateBill, type BillSourceDoc } from '@/module/purchases/domain/billSources';
import { BillEstimateSummary, BillPickedItems } from './BillPickedItems';

const doc = {
  id: 'gr1',
  number: 'FPB/1',
  orderId: 'po1',
  orderNumber: 'PO/1',
  isPriceIncludeTax: false,
  lines: [
    {
      purchaseOrderItemId: 'a',
      receiptItemId: 'r-a',
      description: 'Kertas A4',
      openQty: 20,
      unitPrice: 52000,
      taxRate: 11,
      schedule: null,
    },
  ],
  orderLines: [],
} as unknown as BillSourceDoc;

describe('BillPickedItems', () => {
  it('shows what is open and lets the person type a smaller quantity', async () => {
    const onQuantity = vi.fn();
    render(<BillPickedItems estimate={estimateBill([doc])} onQuantity={onQuantity} />);

    const field = screen.getByRole('textbox', { name: /Qty difakturkan untuk Kertas A4/ });
    expect(field).toHaveValue('20');

    await userEvent.clear(field);
    await userEvent.type(field, '10');

    expect(onQuantity).toHaveBeenLastCalledWith('gr1-a', 10);
  });

  it('never accepts more than is open', async () => {
    const onQuantity = vi.fn();
    render(<BillPickedItems estimate={estimateBill([doc])} onQuantity={onQuantity} />);

    const field = screen.getByRole('textbox', { name: /Qty difakturkan untuk Kertas A4/ });
    await userEvent.clear(field);
    await userEvent.type(field, '99');

    expect(onQuantity).toHaveBeenLastCalledWith('gr1-a', 20);
  });
});

describe('BillEstimateSummary', () => {
  it('says the figures are an estimate until the system has calculated them', () => {
    render(<BillEstimateSummary estimate={estimateBill([doc])} />);

    expect(screen.getByText(/perkiraan|Perkiraan/)).toBeInTheDocument();
  });

  it('shows the system figures instead once they arrive', () => {
    render(
      <BillEstimateSummary
        estimate={estimateBill([doc])}
        preview={{
          taxBase: 760000,
          taxAmount: 83600,
          total: 843600,
          withholdingAmount: 0,
          finalAmount: 843600,
          dueDate: null,
          precision: 2,
          priceChangePending: false,
          pendingPriceChange: null,
        }}
      />
    );

    expect(screen.getByText(/Dihitung oleh sistem/)).toBeInTheDocument();
    expect(screen.getByText(/843\.600/)).toBeInTheDocument();
  });

  it('tells which line is the advance of the order', () => {
    const advanceDoc = {
      ...doc,
      lines: [],
      orderLines: [
        {
          purchaseOrderItemId: 'dp',
          receiptItemId: '',
          description: 'Jasa servis AC — Uang muka 20%',
          openQty: 1,
          unitPrice: 420000,
          taxRate: 11,
          schedule: { kind: 'ADVANCE', seq: 1, of: 1, periodFrom: null, periodTo: null },
        },
      ],
    } as unknown as BillSourceDoc;
    render(<BillPickedItems estimate={estimateBill([advanceDoc])} onQuantity={vi.fn()} />);

    expect(screen.getByText('Uang muka (DP)')).toBeInTheDocument();
  });

  it('shows no advance tag on an ordinary line', () => {
    render(<BillPickedItems estimate={estimateBill([doc])} onQuantity={vi.fn()} />);

    expect(screen.queryByText('Uang muka (DP)')).not.toBeInTheDocument();
  });
});
