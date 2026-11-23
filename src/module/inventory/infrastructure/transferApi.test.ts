import { describe, expect, it } from 'vitest';
import { toCreateBody, toTransfer, toTransferQuery, type TransferDto } from './transferApi';

describe('toCreateBody', () => {
  const input = {
    date: '2026-11-22',
    fromWarehouse: 'a',
    toWarehouse: 'b',
    memo: '  stok penyangga  ',
    lines: [{ product: 'p1', quantity: 5 }],
  };

  it('uses the names the service takes and trims the note', () => {
    expect(toCreateBody(input)).toEqual({
      transactionDate: '2026-11-22',
      fromWarehouse: 'a',
      toWarehouse: 'b',
      items: [{ product: 'p1', quantity: 5 }],
      memo: 'stok penyangga',
    });
  });

  it('leaves an empty note out', () => {
    expect(toCreateBody({ ...input, memo: '   ' })).not.toHaveProperty('memo');
  });
});

describe('toTransferQuery', () => {
  it('sends only what was chosen', () => {
    expect(toTransferQuery({})).toEqual({});
    expect(toTransferQuery({ page: 2, limit: 10, status: 'VOID', warehouse: 'a' })).toEqual({
      page: 2,
      limit: 10,
      status: 'VOID',
      warehouse: 'a',
    });
  });
});

describe('toTransfer', () => {
  const dto: TransferDto = {
    id: 't1',
    transactionNumber: 'PDH/2026/11/0001',
    transactionDate: '2026-11-22T00:00:00.000Z',
    from: { id: 'a', code: 'GDG-004', name: 'Bekasi' },
    to: { id: 'b', code: 'GDG-007', name: 'Bandung' },
    items: [
      {
        id: 'i1',
        productId: 'p1',
        name: 'Kertas',
        sku: 'K',
        unit: 'rim',
        quantity: 30,
        unitCost: 56800,
        value: 1704000,
      },
    ],
    productCount: 1,
    memo: 'Data uji FE',
    status: 'POSTED',
    createdAt: '2026-11-22T09:05:31.538Z',
  };

  it('maps a posted transfer', () => {
    expect(toTransfer(dto)).toMatchObject({
      number: 'PDH/2026/11/0001',
      status: 'posted',
      voidReason: null,
      items: [{ productId: 'p1', quantity: 30, value: 1704000 }],
    });
  });

  it('maps a voided transfer with its reason', () => {
    expect(
      toTransfer({
        ...dto,
        status: 'VOID',
        voidReason: 'Salah gudang',
        voidedAt: '2026-11-22T10:00:00.000Z',
      })
    ).toMatchObject({ status: 'void', voidReason: 'Salah gudang' });
  });

  it('keeps a missing note as an empty string', () => {
    expect(toTransfer({ ...dto, memo: undefined }).memo).toBe('');
  });
});

describe('toTransfer, approval', () => {
  const dto: TransferDto = {
    id: 't2',
    transactionNumber: 'PDH/2026/11/0006',
    transactionDate: '2026-11-23T00:00:00.000Z',
    from: { id: 'a', code: 'GDG-001', name: 'Utama' },
    to: { id: 'b', code: 'GDG-003', name: 'Uji' },
    items: [],
    status: 'PENDING_APPROVAL',
    canDecide: true,
    createdByUser: { id: 'u1', name: 'Firman Bojong' },
    pendingApprovers: [
      { level: 0, name: 'Persetujuan', roles: [{ id: 'r1', name: 'Building Manager' }] },
    ],
  };

  it('maps a transfer that waits for approval, with who made it and who must decide', () => {
    expect(toTransfer(dto)).toMatchObject({
      status: 'pending',
      canDecide: true,
      createdByName: 'Firman Bojong',
      waitingFor: ['Building Manager'],
    });
  });

  it('maps a rejected transfer with who rejected it', () => {
    expect(
      toTransfer({
        ...dto,
        status: 'REJECTED',
        canDecide: false,
        rejectedByUser: { id: 'u2', name: 'Budi' },
        rejectionReason: 'Stok dipakai',
      })
    ).toMatchObject({
      status: 'rejected',
      canDecide: false,
      rejectedByName: 'Budi',
      rejectReason: 'Stok dipakai',
    });
  });

  it('shows no names and no deciding right when the service sends none', () => {
    expect(
      toTransfer({ ...dto, canDecide: undefined, createdByUser: null, pendingApprovers: null })
    ).toMatchObject({ canDecide: false, createdByName: '', waitingFor: [] });
  });

  it('lists a role once when two steps wait for it', () => {
    const role = { id: 'r1', name: 'Building Manager' };
    expect(
      toTransfer({
        ...dto,
        pendingApprovers: [
          { level: 0, roles: [role] },
          { level: 1, roles: [role, { id: 'r2', name: 'Chief Finance' }] },
        ],
      }).waitingFor
    ).toEqual(['Building Manager', 'Chief Finance']);
  });
});
