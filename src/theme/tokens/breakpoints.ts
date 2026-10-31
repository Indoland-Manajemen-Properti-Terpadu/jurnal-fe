/**
 * Responsive breakpoints. postcss.config.cjs repeats these for `$mantine-breakpoint-*`
 * in CSS modules; breakpoints.test.ts keeps the two equal.
 */
export const breakpoints = {
  xs: '36em',
  sm: '48em',
  md: '62em',
  lg: '75em',
  xl: '88em',
} as const;
