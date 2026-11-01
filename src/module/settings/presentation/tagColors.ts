import { palette } from '@/theme';

/**
 * Tag colours are stored by the API as hex strings, so these are real values taken from the
 * palette, not CSS variables. New tags pick one of them; existing tags keep whatever was saved.
 */
export const TAG_PRESET_COLORS: readonly string[] = [
  palette.blue[500],
  palette.emerald[500],
  palette.amber[500],
  palette.red[500],
  palette.violet[500],
  palette.pink[500],
  palette.sky[500],
  palette.slate[500],
];

export const DEFAULT_TAG_COLOR: string = palette.blue[500];

/** A translucent version of a stored hex colour, as a percentage of the colour over transparent. */
export const tint = (color: string, percent: number): string =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;
