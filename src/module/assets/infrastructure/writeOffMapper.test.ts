import { describe, expect, it } from 'vitest';
import { BASE_URL } from '@/lib/http/endpoints';
import type { WriteOffDto } from './writeOffDto';
import { mapWriteOff } from './writeOffMapper';

/** The create response of BA/ASET/2026/11/0001 on the Demo Site, trimmed. */
const pending: WriteOffDto = {
  id: '6afc21070a53958c6fbc5e9a',
  number: 'BA/ASET/2026/11/0001',
  asset: '6af13e3f0fc856d8bfa550ec',
  type: 'damaged',
  status: 'PENDING_APPROVAL',
  incidentDate: '2026-11-10T00:00:00.000Z',
  description: 'Uji coba berita acara: unit AC rusak akibat korsleting, tidak bisa diperbaiki.',
  attachments: [
    {
      id: 'f1',
      filePath: 'uploads/1794908423545-a9addad32da4fdc3.png',
      fileName: 'ev.png',
      mimeType: 'image/png',
    },
  ],
  proceedsAmount: 0,
  proceedsAccount: null,
  gainLossAccount: null,
  snapshot: {
    code: 'AC/001/DEMO-SITE/2026',
    name: 'AC Split Gree 1 PK',
    categoryName: 'Air Conditioner',
    location: 'Tower C - Lantai 8',
    brand: 'Gree',
    acquisitionDate: '2026-04-02T00:00:00.000Z',
    acquisitionCost: 4500000,
    accumulatedDepreciation: 656250,
    bookValue: 3843750,
    estimatedGainLoss: -3843750,
  },
  createdBy: { id: 'u1', name: 'Edi Firman Asep Santoso', email: 'finance2@proapps.id' },
  submittedAt: '2026-11-17T09:40:23.576Z',
  approvals: [],
  pendingApprovers: [
    {
      level: 0,
      name: 'Persetujuan',
      mode: 'ANY',
      roles: [{ id: 'r1', name: 'Chief Finance', approved: false }],
    },
  ],
  canDecide: true,
  signatures: [
    {
      title: 'Dibuat oleh',
      name: 'Edi Firman Asep Santoso',
      role: 'Pengaju',
      signedAt: '2026-11-17T09:40:23.587Z',
      state: 'signed',
      image: {
        id: 's1',
        filePath: 'uploads/1794908423544-0b5887bb94c7d3bd.png',
        mimeType: 'image/png',
      },
    },
    {
      title: 'Disetujui oleh',
      name: null,
      role: 'Chief Finance',
      signedAt: null,
      state: 'waiting',
    },
  ],
};

describe('mapWriteOff', () => {
  it('maps a pending report', () => {
    const report = mapWriteOff(pending);
    expect(report).toMatchObject({
      number: 'BA/ASET/2026/11/0001',
      assetId: '6af13e3f0fc856d8bfa550ec',
      type: 'damaged',
      status: 'PENDING_APPROVAL',
      incidentDate: '2026-11-10',
      result: null,
      decidedAt: null,
      waitingOnRoles: ['Chief Finance'],
      canDecide: true,
      createdBy: { id: 'u1', name: 'Edi Firman Asep Santoso' },
    });
    expect(report.attachments[0].url).toBe(
      `${BASE_URL}/uploads/1794908423545-a9addad32da4fdc3.png`
    );
    expect(report.signatures[0].imageUrl).toBe(
      `${BASE_URL}/uploads/1794908423544-0b5887bb94c7d3bd.png`
    );
    expect(report.signatures[1]).toMatchObject({ state: 'waiting', imageUrl: null, note: null });
    expect(report.snapshot.acquisitionDate).toBe('2026-04-02');
  });

  it('carries the reason of a rejection', () => {
    const report = mapWriteOff({
      ...pending,
      status: 'REJECTED',
      rejectedAt: '2026-11-17T09:42:31.295Z',
      canDecide: false,
      pendingApprovers: [],
      signatures: [
        pending.signatures![0],
        {
          title: 'Ditolak oleh',
          name: 'Edi Firman Asep Santoso',
          role: 'Penyetuju',
          signedAt: '2026-11-17T09:42:31.295Z',
          state: 'rejected',
          note: 'Akun aset belum benar, perbaiki dulu lalu ajukan ulang',
        },
      ],
    });
    expect(report.signatures[1].note).toBe(
      'Akun aset belum benar, perbaiki dulu lalu ajukan ulang'
    );
    expect(report.decidedAt).toBe('2026-11-17T09:42:31.295Z');
    expect(report.waitingOnRoles).toEqual([]);
  });

  it('maps the booked result of an approved report', () => {
    const report = mapWriteOff({
      ...pending,
      status: 'APPROVED',
      result: {
        accumulatedDepreciation: 229166.67,
        bookValue: 12770833.33,
        gainLoss: -12770833.33,
      },
      approvals: [{ at: '2026-11-17T09:42:42.493Z', note: 'Disetujui' }],
    });
    expect(report.result).toEqual({
      accumulatedDepreciation: 229166.67,
      bookValue: 12770833.33,
      gainLoss: -12770833.33,
    });
    expect(report.decidedAt).toBe('2026-11-17T09:42:42.493Z');
  });

  it('accepts an asset sent as an object and an unknown type', () => {
    const report = mapWriteOff({ ...pending, asset: { id: 'a9' }, type: 'mystery' });
    expect(report.assetId).toBe('a9');
    expect(report.type).toBe('scrapped');
  });
});
