import { render, screen, userEvent } from '@test-utils';
import { describe, expect, it, vi } from 'vitest';
import { PeriodFormModal } from './PeriodFormModal';

vi.mock('@/module/period-closing/presentation/hooks/usePeriodQueries', () => ({
  useActivePeriods: () => ({ data: { items: [] }, isLoading: false }),
  useCreatePeriod: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdatePeriod: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('PeriodFormModal lock range (PRO-83)', () => {
  it('warns that the end date has not passed when "Bulan ini" is picked', async () => {
    render(<PeriodFormModal opened period={null} onClose={() => {}} />);
    expect(screen.queryByText(/Tanggal akhir belum lewat/)).toBeNull();

    await userEvent.click(screen.getByText('Bulan ini'));
    expect(await screen.findByText(/Tanggal akhir belum lewat/)).toBeTruthy();

    await userEvent.click(screen.getByText('Bulan lalu'));
    expect(screen.queryByText(/Tanggal akhir belum lewat/)).toBeNull();
  });
});
