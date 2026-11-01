import { describe, expect, it } from 'vitest';
import { colorRoles, type ColorRole } from './tokens';

// WCAG 2.x relative luminance and contrast ratio.
const luminance = (hex: string): number => {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (foreground: string, background: string): number => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

const AA_TEXT = 4.5;
const AA_LARGE_TEXT_AND_UI = 3;

// Pairs listed in docs/design-system.md. Keep the two in sync.
const textPairs: Array<[ColorRole, ColorRole]> = [
  ['textPrimary', 'surface'],
  ['textPrimary', 'surfaceMuted'],
  ['textSecondary', 'surface'],
  ['textSecondary', 'bgSubtle'],
  ['primary', 'surface'],
  ['primary', 'primarySubtle'],
  ['textOnBrand', 'primary'],
  ['successStrong', 'surface'],
  ['successStrong', 'successSubtle'],
  ['warningStrong', 'surface'],
  ['warningStrong', 'warningSubtle'],
  ['dangerStrong', 'surface'],
  ['dangerStrong', 'dangerSubtle'],
  ['infoStrong', 'surface'],
  ['infoStrong', 'infoSubtle'],
];

// borderStrong on surface is 2.5:1, so a border alone must not identify a control.
const nonTextPairs: Array<[ColorRole, ColorRole]> = [
  ['danger', 'surface'],
  ['primary', 'surface'],
];

describe('colour contrast (WCAG AA)', () => {
  it.each(textPairs)('%s on %s reaches 4.5:1 for body text', (foreground, background) => {
    expect(contrast(colorRoles[foreground], colorRoles[background])).toBeGreaterThanOrEqual(
      AA_TEXT
    );
  });

  it.each(nonTextPairs)(
    '%s on %s reaches 3:1 for icons and large text',
    (foreground, background) => {
      expect(contrast(colorRoles[foreground], colorRoles[background])).toBeGreaterThanOrEqual(
        AA_LARGE_TEXT_AND_UI
      );
    }
  );
});
