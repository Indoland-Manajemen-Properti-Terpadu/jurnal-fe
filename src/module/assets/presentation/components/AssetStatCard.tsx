import type { ReactNode } from 'react';
import { Text } from '@mantine/core';
import classes from './AssetStatCards.module.css';

export type AssetStatCardProps = {
  label: string;
  value: string;
  /** Exact figure shown on hover when `value` is a shortened form. */
  valueTitle?: string;
  hint: string;
  /** Small picture of the same data, shown at the right edge of the card. */
  visual?: ReactNode;
};

/** One number with a caption and a small picture of the same data, as on the account list. */
export function AssetStatCard({
  label,
  value,
  valueTitle,
  hint,
  visual,
}: Readonly<AssetStatCardProps>) {
  return (
    <div className={classes.card}>
      <div className={classes.text}>
        <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text className={classes.value} fz={24} fw={700} c="dark.9" mt={4} title={valueTitle}>
          {value}
        </Text>
        <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={6}>
          {hint}
        </Text>
      </div>
      {visual && <div className={classes.visual}>{visual}</div>}
    </div>
  );
}

export const statCardGridClass = classes.grid;
export const statCardClasses = classes;

export default AssetStatCard;
