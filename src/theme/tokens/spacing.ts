import { mapTokens, toRem } from './units';

/** 4px grid. The key is the number of 4px steps: `space[4]` is 16px. */
export const spacePx = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const space = mapTokens(spacePx, toRem);

/** Mantine's `p`, `m`, `gap` names. */
export const spacing = {
  xs: space[2],
  sm: space[3],
  md: space[4],
  lg: space[5],
  xl: space[6],
} as const;

/**
 * The older `--jurnal-spacing-*` names, kept for existing CSS. Their t-shirt names
 * do not match Mantine's (`--jurnal-spacing-md` is 20px, Mantine `md` is 16px), so
 * new CSS uses `--jurnal-space-<n>` instead.
 */
export const legacySpacing = {
  xs: space[2],
  sm: space[3],
  base: space[4],
  md: space[5],
  lg: space[6],
  xl: space[7],
  '2xl': space[8],
  '3xl': space[10],
  '4xl': space[12],
} as const;
