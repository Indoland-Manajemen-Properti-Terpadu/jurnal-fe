import { render, screen } from '@test-utils';
import type { ActivityEntry } from '@/module/purchases/domain/activityLog';
import { ApprovalLogCard } from './ApprovalLogCard';

const entry = (overrides: Partial<ActivityEntry> = {}): ActivityEntry => ({
  id: 'a1',
  action: 'APPROVE',
  label: 'Disetujui',
  step: 1,
  totalSteps: 2,
  stageLabel: '',
  roleName: 'Chief Finance',
  byName: 'Budi',
  at: '2026-11-25T03:00:00.000Z',
  note: '',
  text: 'Disetujui, langkah 1 dari 2 (Chief Finance)',
  ...overrides,
});

describe('ApprovalLogCard', () => {
  it('says there is no history yet for a document made before the log existed', () => {
    render(<ApprovalLogCard entries={[]} />);

    expect(screen.getByText('Log approval')).toBeInTheDocument();
    expect(screen.getByText('Belum ada riwayat')).toBeInTheDocument();
  });

  it('lists who did what, as which role, and the note', () => {
    render(<ApprovalLogCard entries={[entry({ note: 'sesuai anggaran' })]} />);

    expect(screen.getByText('Disetujui')).toBeInTheDocument();
    expect(screen.getByText(/Budi/)).toBeInTheDocument();
    expect(screen.getByText(/Chief Finance/)).toBeInTheDocument();
    expect(screen.getByText(/langkah 1 dari 2/)).toBeInTheDocument();
    expect(screen.getByText('sesuai anggaran')).toBeInTheDocument();
  });

  it('keeps the order the service gave, oldest first', () => {
    render(
      <ApprovalLogCard
        entries={[
          entry({ id: 'a1', label: 'Diajukan', step: null, totalSteps: null }),
          entry({ id: 'a2', label: 'Disetujui' }),
        ]}
      />
    );

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Diajukan');
    expect(items[1]).toHaveTextContent('Disetujui');
  });

  it('names the stage of the document an action belongs to, when the service says it', () => {
    render(<ApprovalLogCard entries={[entry({ stageLabel: 'Pengadaan' })]} />);

    expect(screen.getByText(/Pengadaan/)).toBeInTheDocument();
  });

  it('marks a rejection red with a cross and an approval green with a check', () => {
    const { container } = render(
      <ApprovalLogCard
        entries={[
          entry({ id: 'a1', action: 'APPROVE', label: 'Disetujui' }),
          entry({ id: 'a2', action: 'REJECT', label: 'Ditolak' }),
        ]}
      />
    );

    const markers = container.querySelectorAll('[data-tone]');
    expect(markers[0]).toHaveAttribute('data-tone', 'positive');
    expect(markers[1]).toHaveAttribute('data-tone', 'negative');
    expect(markers[1].querySelector('.tabler-icon-x')).not.toBeNull();
    expect(markers[1].querySelector('.tabler-icon-check')).toBeNull();
  });

  it('shows no step for an action that is not an approval step', () => {
    render(
      <ApprovalLogCard entries={[entry({ label: 'Dibuat', step: null, totalSteps: null })]} />
    );

    expect(screen.queryByText(/langkah/)).not.toBeInTheDocument();
  });
});
