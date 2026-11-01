import type { CSSVariablesResolver } from '@mantine/core';
import {
  colorRoles,
  durations,
  easings,
  fontFamily,
  fontSizes,
  fontWeights,
  gradients,
  layers,
  legacyRadius,
  legacySpacing,
  lineHeights,
  space,
} from './tokens';

type CssVariables = Record<`--jurnal-${string}`, string>;

const kebabCase = (name: string): string =>
  name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

const withPrefix = (
  prefix: string,
  tokens: Readonly<Record<string, string | number>>
): CssVariables => {
  const variables: CssVariables = {};
  for (const [name, value] of Object.entries(tokens)) {
    variables[`--jurnal-${prefix}-${kebabCase(name)}`] = String(value);
  }
  return variables;
};

/**
 * Every `--jurnal-*` custom property, generated from the tokens. MantineProvider
 * writes them to `:root`; nothing else may declare a `--jurnal-*` variable.
 */
export const jurnalCssVariables: CssVariables = {
  '--jurnal-font-family': fontFamily,
  ...withPrefix('font-weight', fontWeights),
  ...withPrefix('text', fontSizes),
  ...withPrefix('leading', lineHeights),
  ...withPrefix('color', colorRoles),
  ...withPrefix('gradient', gradients),
  ...withPrefix('space', space),
  ...withPrefix('spacing', legacySpacing),
  ...withPrefix('radius', legacyRadius),
  ...withPrefix('duration', durations),
  ...withPrefix('ease', easings),
  ...withPrefix('z', layers),
};

/** The app is light-only (`forceColorScheme="light"`), so nothing varies by scheme. */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: jurnalCssVariables,
  light: {},
  dark: {},
});
