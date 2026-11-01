import type { BadgeProps } from '@mantine/core';

/** Names and statuses read as written (no capitals) and are never cut off inside a table cell. */
export const pillProps: Pick<BadgeProps, 'tt' | 'styles' | 'radius'> = {
  tt: 'none',
  radius: 'sm',
  styles: {
    root: { maxWidth: 'none', overflow: 'visible' },
    label: { overflow: 'visible', textOverflow: 'clip' },
  },
};
