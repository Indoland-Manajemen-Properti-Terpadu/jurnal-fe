/** People loaded for the user list, the role cards and the member counts; the API pages by 100 at most. */
export const SITE_USERS_LIMIT = 100;

export const initialsOf = (value: string): string =>
  value
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
