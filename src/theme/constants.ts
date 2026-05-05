/**
 * =============================================
 * Theme Constants & Utilities
 * =============================================
 * Reusable constants untuk styling konsisten
 */

import { rem } from '@mantine/core';
import { themeColors } from '@/theme';

/**
 * Common Table Styles
 * Gunakan untuk styling tabel yang konsisten
 */
export const tableStyles = {
  head: {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    fontWeight: 500,
    fontSize: 14,
    backgroundColor: themeColors.grey[0],
  },
  row: {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    transition: 'background-color 150ms ease',
  },
  cell: {
    fontSize: 14,
    fontWeight: 400,
    padding: `${rem(12)} ${rem(16)}`,
  },
} as const;

/**
 * Common Card Styles
 */
export const cardStyles = {
  default: {
    padding: rem(16),
    radius: rem(8),
    shadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    transition: 'box-shadow 150ms ease',
  },
  hover: {
    '&:hover': {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
      transform: 'translateY(-2px)',
    },
  },
} as const;

/**
 * Common Icon Sizes
 */
export const iconSizes = {
  xs: { width: rem(12), height: rem(12) },
  sm: { width: rem(14), height: rem(14) },
  md: { width: rem(16), height: rem(16) },
  lg: { width: rem(18), height: rem(18) },
  xl: { width: rem(20), height: rem(20) },
} as const;

/**
 * Common Spacing
 */
export const spacing = {
  xs: rem(8),
  sm: rem(12),
  md: rem(16),
  lg: rem(20),
  xl: rem(24),
  xxl: rem(32),
} as const;

/**
 * Breakpoints untuk responsive design
 */
export const breakpoints = {
  xs: '36em',
  sm: '48em',
  md: '62em',
  lg: '75em',
  xl: '88em',
} as const;

/**
 * Common z-index layers
 */
export const zIndex = {
  dropdown: 1000,
  modal: 1100,
  popover: 1200,
  notification: 1300,
  tooltip: 1400,
} as const;

/**
 * Common transition durations
 */
export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;
