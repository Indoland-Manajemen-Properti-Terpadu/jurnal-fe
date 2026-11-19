import { roundToCents } from '../domain/saleMoney';

export const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

/** Money received from the API is rounded half up to the cent at this boundary. */
export const toMoney = (value: unknown): number => roundToCents(toNumber(value));

export const toOptionalMoney = (value: unknown): number | undefined =>
  value !== undefined && value !== null ? toMoney(value) : undefined;

/** A reference the API may send as a bare id or as an object with an id. */
export const toRefId = (
  ref: string | { id?: string; _id?: string } | null | undefined
): string | null => (typeof ref === 'string' ? ref || null : ref?.id || ref?._id || null);

/** The number of a reference the API sends as `{ id, transactionNumber }`; bare ids have none. */
export const toRefNumber = (
  ref: string | { transactionNumber?: string } | null | undefined
): string | null => (typeof ref === 'object' && ref ? ref.transactionNumber || null : null);
