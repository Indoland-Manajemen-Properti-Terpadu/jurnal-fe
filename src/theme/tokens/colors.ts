import { palette } from './palette';

/** Brand colours. Mantine resolves `primary` / `secondary` to shade 6 (`primaryShade: 6`). */
export const brandColors = {
  primary: palette.primary[600],
  secondary: palette.secondary[600],
} as const;

/**
 * Semantic colour roles, emitted as `--jurnal-color-<kebab-name>`.
 * The base feedback colours (success, warning, danger, info) fail WCAG AA for body
 * text on white; use them for icons, fills and borders, and the `*Strong` roles for text.
 */
export const colorRoles = {
  white: palette.white[500],
  black: palette.black[500],

  primary: palette.primary[600],
  primarySubtle: palette.primary[50],
  secondary: palette.secondary[600],

  textPrimary: palette.gray[900],
  textSecondary: palette.gray[500],
  textMuted: palette.gray[500],
  textOnBrand: palette.white[500],

  surface: palette.white[500],
  surfaceHover: palette.gray[50],
  surfaceMuted: palette.gray[100],
  bgSubtle: palette.gray[50],

  borderSubtle: palette.gray[200],
  borderMuted: palette.gray[200],
  borderStrong: palette.gray[400],

  success: palette.green[500],
  successSubtle: palette.green[50],
  successStrong: palette.green[700],
  warning: palette.amber[500],
  warningSubtle: palette.amber[50],
  warningStrong: palette.amber[700],
  danger: palette.red[500],
  dangerSubtle: palette.red[50],
  dangerStrong: palette.red[700],
  info: palette.sky[500],
  infoSubtle: palette.sky[50],
  infoStrong: palette.sky[700],
} as const;

export type ColorRole = keyof typeof colorRoles;

/** CSS gradients, emitted as `--jurnal-gradient-<name>`. */
export const gradients = {
  brand: `linear-gradient(90deg, ${palette.primary[600]}, ${palette.secondary[900]})`,
  brandDiagonal: `linear-gradient(200deg, ${palette.primary[600]}, ${palette.secondary[900]})`,
  brandOverlay: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, ${palette.primary[800]} 100%)`,
} as const;

const brandGradient = { from: 'primary', to: 'secondary.9', deg: 90 };

/** Gradients for Mantine's `gradient` prop (`variant="gradient"`). */
export const gradientColors = {
  primaryGradient: gradients.brandDiagonal,
  gradient: brandGradient,
  primarySecondary: brandGradient,
  mainGR: brandGradient,
  limeGreen: { from: '#00bb7d', to: '#68c937', deg: 90 },
  peach: { from: '#f27794', to: '#f08779', deg: 90 },
};

/** @deprecated Use `gradientColors.gradient`. */
export const buttonGradient = { gradient: brandGradient };

/** @deprecated Use `colorRoles.white` or Mantine's `c="white"`. */
export const primaryColor = { white: palette.white[500] };
