import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WriteOffDraft } from '@/module/assets/domain/writeOff';
import {
  addWriteOffAttachments,
  approveWriteOff,
  createWriteOff,
  downloadWriteOffPdf,
  fetchCurrentUserId,
  fetchWriteOffs,
  rejectWriteOff,
  runDepreciation,
} from './writeOffApi';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const reportDto = {
  id: 'r1',
  number: 'BA/ASET/2026/11/0001',
  asset: 'a1',
  type: 'scrapped',
  status: 'PENDING_APPROVAL',
  incidentDate: '2026-11-10T00:00:00.000Z',
  description: 'Mesin tidak layak pakai lagi.',
};

const signature = new Blob(['sig'], { type: 'image/png' });
const draft = (patch: Partial<WriteOffDraft> = {}): WriteOffDraft => ({
  type: 'scrapped',
  incidentDate: '2026-11-10',
  description: 'Mesin tidak layak pakai lagi.',
  hasProceeds: false,
  proceedsAmount: 0,
  proceedsAccount: '',
  gainLossAccount: '',
  evidence: [new File(['x'], 'bukti.png', { type: 'image/png' })],
  signature,
  ...patch,
});

const sentForm = (): FormData => http.post.mock.calls[0][1] as FormData;

beforeEach(() => {
  http.get.mockReset();
  http.post.mockReset();
  http.post.mockResolvedValue({ data: { data: reportDto } });
});

describe('writeOffApi', () => {
  it('files a report as multipart without a receiving account when nothing came in', async () => {
    await createWriteOff('a1', draft());
    expect(http.post.mock.calls[0][0]).toBe('/v1/asset-reports');
    const form = sentForm();
    expect(form.get('assetId')).toBe('a1');
    expect(form.get('type')).toBe('scrapped');
    expect(form.get('incidentDate')).toBe('2026-11-10');
    expect(form.get('proceedsAmount')).toBe('0');
    expect(form.has('proceedsAccount')).toBe(false);
    expect(form.has('gainLossAccount')).toBe(false);
    expect(form.get('signature')).toBeInstanceOf(Blob);
    expect(form.getAll('attachments')).toHaveLength(1);
  });

  it('sends the price and its account for a sale', async () => {
    await createWriteOff(
      'a1',
      draft({
        type: 'sold',
        proceedsAmount: 8000000,
        proceedsAccount: 'bank1',
        gainLossAccount: 'gl',
      })
    );
    const form = sentForm();
    expect(form.get('proceedsAmount')).toBe('8000000');
    expect(form.get('proceedsAccount')).toBe('bank1');
    expect(form.get('gainLossAccount')).toBe('gl');
  });

  it('ignores an amount the user typed and then switched off', async () => {
    await createWriteOff(
      'a1',
      draft({ type: 'damaged', hasProceeds: false, proceedsAmount: 500000, proceedsAccount: 'b' })
    );
    expect(sentForm().get('proceedsAmount')).toBe('0');
    expect(sentForm().has('proceedsAccount')).toBe(false);
  });

  it('approves with a signature and only a note that was written', async () => {
    await approveWriteOff('r1', signature, '  ');
    expect(http.post.mock.calls[0][0]).toBe('/v1/asset-reports/r1/approve');
    expect(sentForm().get('signature')).toBeInstanceOf(Blob);
    expect(sentForm().has('note')).toBe(false);
  });

  it('rejects with a reason as JSON', async () => {
    await rejectWriteOff('r1', 'Akun salah');
    expect(http.post).toHaveBeenCalledWith('/v1/asset-reports/r1/reject', { reason: 'Akun salah' });
  });

  it('adds evidence files to a pending report', async () => {
    await addWriteOffAttachments('r1', [new File(['x'], 'a.pdf', { type: 'application/pdf' })]);
    expect(http.post.mock.calls[0][0]).toBe('/v1/asset-reports/r1/attachments');
    expect(sentForm().getAll('attachments')).toHaveLength(1);
  });

  it('lists with only the filters that are set', async () => {
    http.get.mockResolvedValue({
      data: {
        data: { data: [reportDto], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } },
      },
    });
    const page = await fetchWriteOffs({ page: 1, limit: 10, status: 'PENDING_APPROVAL' });
    expect(http.get).toHaveBeenCalledWith('/v1/asset-reports', {
      params: { page: 1, limit: 10, status: 'PENDING_APPROVAL' },
    });
    expect(page.items[0].number).toBe('BA/ASET/2026/11/0001');
    expect(page.pagination.total).toBe(1);
  });

  it('downloads the PDF under the name the server gives', async () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    http.get.mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename=BA-ASET-2026-11-0001.pdf' },
    });
    const file = await downloadWriteOffPdf('r1');
    expect(http.get).toHaveBeenCalledWith('/v1/asset-reports/r1/pdf', { responseType: 'blob' });
    expect(file.fileName).toBe('BA-ASET-2026-11-0001.pdf');
    expect(file.blob).toBe(blob);
  });

  it('falls back to a plain file name', async () => {
    http.get.mockResolvedValue({ data: new Blob(['%PDF']), headers: {} });
    expect((await downloadWriteOffPdf('r1')).fileName).toBe('berita-acara.pdf');
  });

  it('reads the signed-in user id', async () => {
    http.get.mockResolvedValue({ data: { id: 'u1', name: 'Edi' } });
    expect(await fetchCurrentUserId()).toBe('u1');
    expect(http.get).toHaveBeenCalledWith('/v1/users/me');
  });

  it('books depreciation up to a month', async () => {
    http.post.mockResolvedValue({
      data: {
        data: {
          upTo: '2026-10',
          assets: 1,
          months: 2,
          amount: 5000000,
          plan: [{ code: 'IT/002', months: 2, from: '2026-09', to: '2026-10', amount: 5000000 }],
          skipped: [],
          failed: [{ code: 'GST/002', reason: 'Periode Oktober 2026 dikunci' }],
        },
      },
    });
    const result = await runDepreciation({ upTo: '2026-10' });
    expect(http.post).toHaveBeenCalledWith('/v1/assets/depreciation/run', { upTo: '2026-10' });
    expect(result.failed).toEqual([{ code: 'GST/002', reason: 'Periode Oktober 2026 dikunci' }]);
    expect(result.amount).toBe(5000000);
  });
});
