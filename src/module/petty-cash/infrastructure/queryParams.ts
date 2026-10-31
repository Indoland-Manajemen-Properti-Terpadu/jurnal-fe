export type QueryValue = string | number | boolean | readonly string[] | null | undefined;

/**
 * The backend rejects empty and unknown query values with a 400, so a param is sent only when it
 * carries a value. A list (for example several statuses) is sent comma separated.
 */
export const cleanParams = (
  params: Record<string, QueryValue>
): Record<string, string | number | boolean> =>
  Object.entries(params).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    if (Array.isArray(value)) {
      if (value.length > 0) acc[key] = value.join(',');
      return acc;
    }
    if (typeof value === 'string') {
      if (value.trim() !== '') acc[key] = value;
      return acc;
    }
    acc[key] = value as number | boolean;
    return acc;
  }, {});
