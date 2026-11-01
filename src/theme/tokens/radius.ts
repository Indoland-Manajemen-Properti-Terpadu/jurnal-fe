import { mapTokens, toRem } from './units';

/** Mantine's `radius` names and values. `md` is the app-wide default radius. */
export const radiusPx = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 32,
} as const;

export const radius = mapTokens(radiusPx, toRem);

export const defaultRadius = 'md' satisfies keyof typeof radius;

/**
 * The older `--jurnal-radius-*` names, kept for existing CSS. They are offset from
 * Mantine's (`--jurnal-radius-md` is 4px, Mantine `md` is 8px), so new CSS uses
 * `--mantine-radius-*`, which matches the `radius` prop.
 */
export const legacyRadius = {
  sm: toRem(2),
  md: toRem(4),
  lg: toRem(8),
  xl: toRem(12),
  '2xl': toRem(16),
  '3xl': toRem(24),
  full: '999px',
} as const;
