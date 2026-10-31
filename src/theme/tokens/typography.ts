import { mapTokens, toRem } from './units';

export const fontFamily = 'Figtree, sans-serif';

/** The weights loaded in src/styles/fonts.css. Any other weight is synthesised by the browser. */
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Type scale in px (design-file units). xs..xl are also Mantine's `fz` / `size` names. */
export const fontSizePx = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
} as const;

/** Fixed line height paired with each font size, in px. */
export const lineHeightPx = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 28,
  '2xl': 30,
  '3xl': 38,
  '4xl': 48,
  '5xl': 58,
  '6xl': 68,
} as const satisfies Record<keyof typeof fontSizePx, number>;

export type FontSize = keyof typeof fontSizePx;

export const fontSizes = mapTokens(fontSizePx, toRem);

export const lineHeights = mapTokens(lineHeightPx, toRem);

/**
 * Unitless line heights Mantine applies for `<Text size>` and the body. These are
 * Mantine 8's defaults, kept so existing text does not reflow.
 */
export const mantineLineHeights = {
  xs: '1.4',
  sm: '1.45',
  md: '1.55',
  lg: '1.6',
  xl: '1.65',
} as const;

export type TextStyle = {
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
  readonly fontWeight?: number;
  readonly fontVariantNumeric?: string;
};

const textStyle = (size: FontSize, letterSpacingPx = 0, fontWeight?: number): TextStyle => ({
  fontSize: fontSizes[size],
  lineHeight: lineHeights[size],
  letterSpacing: toRem(letterSpacingPx),
  ...(fontWeight === undefined ? {} : { fontWeight }),
});

/** Heading levels; also drive Mantine `<Title order>`. */
export const headingStyles = {
  h1: textStyle('6xl', -0.5, fontWeights.semibold),
  h2: textStyle('5xl', -0.4, fontWeights.semibold),
  h3: textStyle('4xl', -0.3, fontWeights.semibold),
  h4: textStyle('3xl', -0.2, fontWeights.semibold),
  h5: textStyle('2xl', -0.15, fontWeights.semibold),
  h6: { ...textStyle('xl', 0, fontWeights.semibold), lineHeight: toRem(24) },
} as const satisfies Record<string, TextStyle>;

/**
 * Text styles for inline `style` or spreading into Mantine `styles`. Labels are
 * tightened slightly; `numeric` lines digits up in columns of money.
 */
export const textStyles = {
  bodyLg: textStyle('lg'),
  body: textStyle('md'),
  bodySm: textStyle('sm'),
  bodyXs: textStyle('xs'),
  labelLg: { ...textStyle('md', -0.18), lineHeight: toRem(22) },
  label: textStyle('sm', -0.16),
  labelSm: textStyle('xs', -0.12),
  caption: textStyle('xs'),
  numeric: { ...textStyle('sm'), fontVariantNumeric: 'tabular-nums' },
} as const satisfies Record<string, TextStyle>;
