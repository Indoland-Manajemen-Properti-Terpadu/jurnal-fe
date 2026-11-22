import { describe, expect, it } from 'vitest';
import { resolveAuditChange } from './warehouseAudit';

const lookups = {
  people: { u1: 'Asep Anas' },
  products: { p1: 'Kertas A4 80 gsm' },
  unknownPerson: 'pengguna lain',
};

describe('resolveAuditChange', () => {
  it('names the person in charge instead of showing the id', () => {
    expect(resolveAuditChange({ field: 'picUserId', from: null, to: 'u1' }, lookups)).toEqual({
      field: 'picUserId',
      from: null,
      to: 'Asep Anas',
    });
  });

  it('uses a plain label for a person it cannot name', () => {
    expect(resolveAuditChange({ field: 'picUserId', from: 'gone', to: 'u1' }, lookups).from).toBe(
      'pengguna lain'
    );
  });

  it('splits the minimum-stock field into the field and the product', () => {
    expect(resolveAuditChange({ field: 'minQty:p1', from: '0', to: '3' }, lookups)).toEqual({
      field: 'minQty',
      subject: 'Kertas A4 80 gsm',
      from: '0',
      to: '3',
    });
  });

  it('leaves the product out when it is not known', () => {
    expect(
      resolveAuditChange({ field: 'minQty:zzz', from: '0', to: '3' }, lookups).subject
    ).toBeUndefined();
  });

  it('passes other fields through untouched', () => {
    expect(resolveAuditChange({ field: 'city', from: null, to: 'Jakarta' }, lookups)).toEqual({
      field: 'city',
      from: null,
      to: 'Jakarta',
    });
  });
});
