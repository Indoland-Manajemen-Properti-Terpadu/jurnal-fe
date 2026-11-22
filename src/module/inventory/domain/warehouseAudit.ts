import type { AuditChange } from '@/module/inventory/domain/warehouse';

export interface AuditLookups {
  /** User id to name, for the person in charge. */
  people: Record<string, string>;
  /** Product id to name, for the minimum-stock changes. */
  products: Record<string, string>;
  /** Shown for a person id that cannot be named. */
  unknownPerson: string;
}

export interface ResolvedChange {
  field: string;
  /** The product a minimum-stock change is about. */
  subject?: string;
  from: string | null;
  to: string | null;
}

const MIN_QTY_PREFIX = 'minQty:';

/**
 * The service logs the person in charge and a product's minimum by id. This turns them into names,
 * so a change reads as "Penanggung jawab: (kosong) → Asep Anas" and never shows an id.
 */
export const resolveAuditChange = (change: AuditChange, lookups: AuditLookups): ResolvedChange => {
  if (change.field.startsWith(MIN_QTY_PREFIX)) {
    const subject = lookups.products[change.field.slice(MIN_QTY_PREFIX.length)];
    return {
      field: 'minQty',
      ...(subject ? { subject } : {}),
      from: change.from,
      to: change.to,
    };
  }
  if (change.field === 'picUserId') {
    const name = (id: string | null) =>
      id === null ? null : (lookups.people[id] ?? lookups.unknownPerson);
    return { field: 'picUserId', from: name(change.from), to: name(change.to) };
  }
  return { field: change.field, from: change.from, to: change.to };
};
