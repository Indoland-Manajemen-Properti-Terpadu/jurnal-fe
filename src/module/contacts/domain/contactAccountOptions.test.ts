import { describe, expect, it } from 'vitest';
import {
  buildAccountSelectData,
  buildGroupOptions,
  buildPaymentTermOptions,
  groupAccountOptions,
} from './contactAccountOptions';

describe('contactAccountOptions', () => {
  const general = groupAccountOptions(
    [
      { id: 'a1', label: '1 · Kas', category: 'Aset' },
      { id: 'a1', label: 'dup', category: 'Aset' },
      { id: 'a2', label: 'Hutang', category: 'Liabilitas' },
      { id: 'a3', label: 'Lain', category: '' },
      { id: '', label: 'no id', category: 'Aset' },
    ],
    'Akun Lainnya'
  );

  it('groups the general chart by category without duplicate ids', () => {
    expect(general).toEqual([
      { group: 'Aset', items: [{ value: 'a1', label: '1 · Kas' }] },
      { group: 'Liabilitas', items: [{ value: 'a2', label: 'Hutang' }] },
      { group: 'Akun Lainnya', items: [{ value: 'a3', label: 'Lain' }] },
    ]);
  });

  it('puts recommended accounts first and removes them from the general groups', () => {
    const data = buildAccountSelectData(
      [{ id: 'a1', accountNumber: '1', name: 'Kas', category: 'AR' }],
      general,
      'Rekomendasi'
    );
    expect(data.map((g) => g.group)).toEqual(['Rekomendasi', 'Liabilitas', 'Akun Lainnya']);
    expect(data[0].items).toEqual([{ value: 'a1', label: '1 - Kas' }]);
  });

  it('falls back to the general chart when nothing is recommended', () => {
    expect(buildAccountSelectData([], general, 'Rekomendasi')).toEqual(general);
  });

  it('deduplicates group names and payment term days', () => {
    expect(
      buildGroupOptions([
        { id: '1', name: 'VIP' },
        { id: '2', name: 'VIP' },
        { id: '3', name: '' },
      ])
    ).toEqual([{ value: 'VIP', label: 'VIP' }]);

    expect(
      buildPaymentTermOptions(
        [
          { id: 'a', name: 'COD', days: 0, isDefault: true },
          { id: 'b', name: 'Net 15', days: 15, isDefault: false },
          { id: 'c', name: 'Dup', days: 15, isDefault: false },
        ],
        { immediate: 'Langsung Tunai', days: (count) => `${count} hari` }
      )
    ).toEqual([
      { value: '0', label: 'COD (Langsung Tunai)' },
      { value: '15', label: 'Net 15 (15 hari)' },
    ]);
  });
});
