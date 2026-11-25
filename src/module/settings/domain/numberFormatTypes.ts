/** A document type the service can number, with its default number and the format the site set. */
export interface NumberFormatTypeInfo {
  /** The value sent to `POST /settings/number-formats`. */
  type: string;
  label: string;
  group: string;
  groupLabel: string;
  /** False for types the site must give a format before it can make them (invoice, transaction). */
  hasDefault: boolean;
  defaultPrefix: string | null;
  /** The first default number of this month ("PR/2026/11/0001"). */
  defaultExample: string | null;
  restartsEvery: 'MONTH' | 'YEAR' | null;
  /** Every format of the type, inactive ones included. */
  formatCount: number;
  /** The active format of the site; it replaces the default completely. */
  format: {
    id: string;
    prefix: string;
    suffix: string;
    status: 'active' | 'inactive';
    startNumber: number;
    currentNumber: number;
    nextNumber: string;
  } | null;
}

const GROUP_ORDER = ['general', 'sale', 'purchase', 'stock'];

/** A site format is prefix + a five-digit running number + suffix, with no year or month. */
export const formatExample = (prefix: string, number: number, suffix: string): string =>
  `${prefix}${String(number).padStart(5, '0')}${suffix}`;

export interface NumberFormatTypeGroup {
  group: string;
  items: { value: string; label: string }[];
}

/** The types as grouped options for a select: known groups in a fixed order, new ones after them. */
export const groupNumberFormatTypes = (
  types: readonly NumberFormatTypeInfo[]
): NumberFormatTypeGroup[] => {
  const byGroup = new Map<string, { label: string; items: { value: string; label: string }[] }>();
  types.forEach((entry) => {
    const found = byGroup.get(entry.group) ?? { label: entry.groupLabel, items: [] };
    found.items.push({ value: entry.type, label: entry.label });
    byGroup.set(entry.group, found);
  });
  const rank = (key: string) => {
    const index = GROUP_ORDER.indexOf(key);
    return index === -1 ? GROUP_ORDER.length : index;
  };
  return [...byGroup.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]))
    .map(([, value]) => ({ group: value.label, items: value.items }));
};

export type NumberFormatTypeHint =
  | { kind: 'required' }
  | { kind: 'default'; example: string; restartsEvery: 'MONTH' | 'YEAR' | null }
  | { kind: 'active'; next: string };

/** What to tell the person about a type once it is chosen, so they know what the number is now. */
export const numberFormatTypeHint = (entry: NumberFormatTypeInfo): NumberFormatTypeHint => {
  if (entry.format) return { kind: 'active', next: entry.format.nextNumber };
  if (!entry.hasDefault) return { kind: 'required' };
  return {
    kind: 'default',
    example: entry.defaultExample ?? '',
    restartsEvery: entry.restartsEvery,
  };
};
