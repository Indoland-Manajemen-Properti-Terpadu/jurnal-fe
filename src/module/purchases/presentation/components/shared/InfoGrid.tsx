import type { ReactNode } from 'react';
import { Text } from '@mantine/core';
import classes from '@/module/purchases/presentation/components/shared/InfoGrid.module.css';

export interface InfoItem {
  label: string;
  value: ReactNode;
  /** A dimmed line under the value. */
  sub?: ReactNode;
  /** 2 spans the full width of the grid. */
  span?: 1 | 2;
}

/**
 * Facts as bordered cells, two columns from tablet width, as in the reference web: a small label
 * over a bold value. Put it in a `flush` card so the lines run to the edges.
 */
export const InfoGrid = ({ items }: Readonly<{ items: InfoItem[] }>) => {
  // A lone cell before a full-width one (or at the end) would leave a hole beside it, so it widens.
  let inRow = 0;
  const widths = items.map((item, index) => {
    if (item.span === 2) {
      inRow = 0;
      return 2;
    }
    inRow += 1;
    const alone = inRow % 2 === 1 && (index === items.length - 1 || items[index + 1].span === 2);
    return alone ? 2 : 1;
  });
  return (
    <div className={classes.grid}>
      {items.map(({ label, value, sub }, index) => (
        <div
          key={label}
          className={classes.cell}
          data-span={widths[index] === 2 ? 'full' : undefined}
        >
          <Text fz="xs" c="dimmed" fw={500}>
            {label}
          </Text>
          <Text fz="md" fw={700} component="div" lh={1.35}>
            {value === null || value === undefined || value === '' ? '-' : value}
          </Text>
          {sub && (
            <Text fz="xs" c="dimmed" component="div">
              {sub}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
};
