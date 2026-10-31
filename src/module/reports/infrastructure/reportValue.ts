export function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value != null) return String(value);
  return fallback;
}

export type RawRecord = Record<string, unknown>;

export function asRecord(value: unknown): RawRecord {
  return value && typeof value === 'object' ? (value as RawRecord) : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
