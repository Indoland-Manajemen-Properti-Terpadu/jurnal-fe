/**
 * An account reference arrives as an id string or as an object with `id` or `_id`
 * depending on the endpoint; the form and the payload only need the id.
 */
export const extractAccountId = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'id' in value) return String((value as { id: unknown }).id);
  if (typeof value === 'object' && '_id' in value) return String((value as { _id: unknown })._id);
  return null;
};
