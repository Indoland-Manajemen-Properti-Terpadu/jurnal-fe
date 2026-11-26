import { Text } from '@mantine/core';
import classes from '@/module/purchases/presentation/components/shared/InfoGrid.module.css';

/** Totals as big bordered cells, two to a row ("Total item", "Total diterima"), as in the reference web. */
export const StatGrid = ({ items }: Readonly<{ items: { label: string; value: string }[] }>) => (
  <div className={classes.stats}>
    {items.map(({ label, value }, index) => (
      <div
        key={label}
        className={classes.cell}
        data-last-odd={index === items.length - 1 && items.length % 2 === 1 ? 'full' : undefined}
      >
        <Text fz="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text fz="xl" fw={700} lh={1.3} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Text>
      </div>
    ))}
  </div>
);
