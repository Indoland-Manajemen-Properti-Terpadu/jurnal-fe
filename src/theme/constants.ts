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
// export const tableStyles = {
//   head: {
//     borderColor: themeColors.gray[1],
//     borderWidth: '1px',
//     borderStyle: 'solid' as const,
//     fontWeight: 500,
//     fontSize: 14,
//     backgroundColor: themeColors.gray[0],
//   },
//   row: {
//     borderColor: themeColors.gray[1],
//     borderWidth: '1px',
//     borderStyle: 'solid' as const,
//     transition: 'background-color 150ms ease',
//   },
//   cell: {
//     fontSize: 14,
//     fontWeight: 400,
//     padding: `${rem(12)} ${rem(16)}`,
//   },
// } as const;

// /**
//  * Common Card Styles
//  */
// export const cardStyles = {
//   default: {
//     padding: rem(16),
//     radius: rem(8),
//     shadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
//     transition: 'box-shadow 150ms ease',
//   },
//   hover: {
//     '&:hover': {
//       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
//       transform: 'translateY(-2px)',
//     },
//   },
// } as const;

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

/**
 * Figma Design Tokens (source: Design-System-Lite)
 * Pakai ini sebagai single source untuk ukuran/warna/typography reusable.
 */
export const figmaSpacing = {
  zero: rem(0),
  px: rem(1),
  xxs: rem(2),
  xs2: rem(4),
  xs: rem(8),
  sm: rem(12),
  base: rem(16),
  md: rem(20),
  lg: rem(24),
  xl: rem(28),
  xl2: rem(32),
  xl3: rem(40),
  xl4: rem(48),
  xl5: rem(60),
  xl6: rem(72),
} as const;

// export const figmaRadius = {
//   none: rem(0),
//   sm: rem(2),
//   md: rem(4),
//   lg: rem(8),
//   xl: rem(12),
//   '2xl': rem(16),
//   '3xl': rem(24),
//   '4xl': rem(32),
//   '5xl': rem(48),
//   full: '999px',
// } as const;

export const figmaTypography = {
  fontFamily: 'Figtree, sans-serif',
  heading: {
    h1: { fontSize: rem(56), lineHeight: '68px', fontWeight: 600, letterSpacing: rem(-0.5) },
    h2: { fontSize: rem(48), lineHeight: '58px', fontWeight: 600, letterSpacing: rem(-0.4) },
    h3: { fontSize: rem(40), lineHeight: '48px', fontWeight: 600, letterSpacing: rem(-0.3) },
    h4: { fontSize: rem(32), lineHeight: '38px', fontWeight: 600, letterSpacing: rem(-0.2) },
    h5: { fontSize: rem(24), lineHeight: '30px', fontWeight: 600, letterSpacing: rem(-0.15) },
    h6: { fontSize: rem(20), lineHeight: '24px', fontWeight: 600, letterSpacing: '0px' },
  },
  body: {
    body1: { fontSize: rem(18), lineHeight: '28px', letterSpacing: '0px' },
    body2: { fontSize: rem(16), lineHeight: '24px', letterSpacing: '0px' },
    body3: { fontSize: rem(14), lineHeight: '20px', letterSpacing: '0px' },
    body4: { fontSize: rem(12), lineHeight: '16px', letterSpacing: '0px' },
  },
  label: {
    label1: { fontSize: rem(16), lineHeight: '22px', letterSpacing: rem(-0.18) },
    label2: { fontSize: rem(14), lineHeight: '20px', letterSpacing: rem(-0.16) },
    label3: { fontSize: rem(12), lineHeight: '16px', letterSpacing: rem(-0.12) },
  },
  caption: {
    caption1: { fontSize: rem(10), lineHeight: '12px', letterSpacing: '0px' },
    caption2: { fontSize: rem(9), lineHeight: '10px', letterSpacing: '0px' },
  },
} as const;

export const semanticColors = {
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  borderSubtle: '#e5e7eb',
  bgSubtle: '#f9fafb',
} as const;
