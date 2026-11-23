import { render, screen, userEvent } from '@test-utils';
import type { Procurement } from '@/module/purchases/domain/procurement';
import { ProcurementNotes } from './ProcurementNotes';

const quote = (vendorId: string) => ({
  vendor: { id: vendorId },
  lines: [{ finalPrice: null, unitPrice: 100 }],
});

const procurement = (overrides: Record<string, unknown> = {}): Procurement =>
  ({
    route: 'BIDDING',
    winnerId: 'v2',
    cheapestVendorId: 'v1',
    minQuotes: 2,
    quotes: [quote('v1'), quote('v2')],
    totals: { q1: { complete: true }, q2: { complete: true } },
    singleReason: '',
    belowMinQuotesReason: '',
    reason: '',
    negotiationNote: '',
    ...overrides,
  }) as unknown as Procurement;

const setup = (p: Procurement, editable = true) => {
  const onSave = vi.fn();
  render(<ProcurementNotes procurement={p} editable={editable} saving={false} onSave={onSave} />);
  return { onSave };
};

describe('ProcurementNotes', () => {
  it('has one reason-and-negotiation field on bidding, with no separate save button', () => {
    setup(procurement());
    expect(screen.getByLabelText(/Alasan pemilihan & catatan negosiasi/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Simpan catatan/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Alasan vendor tunggal')).not.toBeInTheDocument();
  });

  it('does not show a single-vendor reason left over on a bidding procurement', () => {
    setup(procurement({ singleReason: 'Hanya satu vendor', route: 'BIDDING' }));
    expect(screen.queryByText('Alasan vendor tunggal')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Hanya satu vendor')).not.toBeInTheDocument();
  });

  it('marks the field required when the winner is not the cheapest, and not otherwise', () => {
    const { unmount } = render(
      <ProcurementNotes procurement={procurement()} editable saving={false} onSave={vi.fn()} />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
    unmount();
    render(
      <ProcurementNotes
        procurement={procurement({ winnerId: 'v1' })}
        editable
        saving={false}
        onSave={vi.fn()}
      />
    );
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('saves a field when it is left, with everything typed', async () => {
    const { onSave } = setup(procurement());
    const field = screen.getByLabelText(/Alasan pemilihan & catatan negosiasi/);
    await userEvent.type(field, 'Harga lebih baik setelah negosiasi');
    await userEvent.tab();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'Harga lebih baik setelah negosiasi' })
    );
  });

  it('does not save when nothing changed', async () => {
    const { onSave } = setup(procurement({ reason: 'Sudah ada' }));
    const field = screen.getByLabelText(/Alasan pemilihan & catatan negosiasi/);
    await userEvent.click(field);
    await userEvent.tab();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('is read only once the procurement is submitted', () => {
    setup(procurement({ reason: 'Sudah ada' }), false);
    expect(screen.getByLabelText(/Alasan pemilihan & catatan negosiasi/)).toBeDisabled();
  });
});
