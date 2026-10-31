/**
 * z-index scale. `app`..`overlay` equal Mantine's getDefaultZIndex() values, so
 * custom layers stack predictably against Mantine's AppShell, Modal and Popover.
 */
export const layers = {
  base: 0,
  raised: 1,
  sticky: 10,
  app: 100,
  modal: 200,
  popover: 300,
  overlay: 400,
  max: 9999,
} as const;

export type Layer = keyof typeof layers;
