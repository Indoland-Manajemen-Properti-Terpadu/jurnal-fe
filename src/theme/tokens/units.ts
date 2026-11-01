/** Root font size the design file is drawn against. */
const ROOT_FONT_SIZE_PX = 16;

/**
 * Converts a design-file pixel value to rem, so sizes follow the user's browser
 * font-size setting. `toRem(14)` → `'0.875rem'`.
 */
export const toRem = (px: number): string => (px === 0 ? '0' : `${px / ROOT_FONT_SIZE_PX}rem`);

/** Maps every value of a token record, keeping its keys. */
export const mapTokens = <Key extends string, Value, Result>(
  tokens: Readonly<Record<Key, Value>>,
  transform: (value: Value) => Result
): Record<Key, Result> => {
  const entries = Object.entries(tokens) as Array<[Key, Value]>;
  return Object.fromEntries(entries.map(([key, value]) => [key, transform(value)])) as Record<
    Key,
    Result
  >;
};
