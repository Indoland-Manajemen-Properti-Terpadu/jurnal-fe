import type { StockOpname } from './stockOpname';
import { opnameStages } from './opnameStages';

const base = {
  status: 'posted',
  createdAt: '2026-11-25T03:35:00.000Z',
  createdByName: 'Firman',
  startedAt: '2026-11-25T03:36:00.000Z',
  postedAt: '2026-11-25T03:38:00.000Z',
  approvedByName: null,
  history: [
    { at: '2026-11-25T03:35:00.000Z', action: 'Dokumen dibuat', note: '', userName: 'Firman' },
    { at: '2026-11-25T03:36:00.000Z', action: 'Hitungan dimulai', note: '', userName: 'Firman' },
    {
      at: '2026-11-25T03:37:00.000Z',
      action: 'Dikirim untuk persetujuan',
      note: '',
      userName: 'Firman',
    },
    {
      at: '2026-11-25T03:38:00.000Z',
      action: 'Disetujui dan diposting',
      note: '',
      userName: 'Budi',
    },
  ],
} as unknown as StockOpname;

describe('opnameStages', () => {
  it('gives every stage of a posted count its time and who did it', () => {
    const { done, details } = opnameStages(base);

    expect(done).toBe(4);
    expect(details.draft).toEqual({ at: '2026-11-25T03:35:00.000Z', by: 'Firman' });
    expect(details.counting.at).toBe('2026-11-25T03:36:00.000Z');
    expect(details.pending_approval).toEqual({ at: '2026-11-25T03:37:00.000Z', by: 'Firman' });
    expect(details.posted).toEqual({ at: '2026-11-25T03:38:00.000Z', by: 'Budi' });
  });

  it('prefers the approver the service records over the one read from the history', () => {
    const { details } = opnameStages({ ...base, approvedByName: 'Ketua' });

    expect(details.posted.by).toBe('Ketua');
  });

  it('uses the latest submission when a count was sent back and sent again', () => {
    const history = [
      ...base.history.slice(0, 3),
      {
        at: '2026-11-25T03:37:30.000Z',
        action: 'Ditolak, dikembalikan ke petugas',
        note: 'x',
        userName: 'Budi',
      },
      {
        at: '2026-11-25T03:37:50.000Z',
        action: 'Dikirim untuk persetujuan',
        note: '',
        userName: 'Firman',
      },
    ];

    const { details } = opnameStages({
      ...base,
      status: 'pending_approval',
      postedAt: null,
      history,
    });

    expect(details.pending_approval.at).toBe('2026-11-25T03:37:50.000Z');
    expect(details.posted).toEqual({ at: null, by: null });
  });

  it('keeps the stages a cancelled count went through', () => {
    const { done, details } = opnameStages({ ...base, status: 'cancelled' });

    expect(done).toBe(4);
    expect(details.posted.at).toBe('2026-11-25T03:38:00.000Z');
  });

  it('shows a cancelled count that never reached approval only up to where it got', () => {
    const history = base.history.slice(0, 2);

    const { done } = opnameStages({ ...base, status: 'cancelled', postedAt: null, history });

    expect(done).toBe(2);
  });

  it('leaves a stage empty when nothing says when it happened', () => {
    const { details } = opnameStages({
      ...base,
      status: 'draft',
      startedAt: null,
      postedAt: null,
      history: [],
    });

    expect(details.counting).toEqual({ at: null, by: null });
  });
});
