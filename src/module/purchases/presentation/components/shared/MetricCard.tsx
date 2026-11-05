import type { ReactNode } from 'react';
import { Text } from '@mantine/core';
import classes from '@/module/purchases/presentation/components/shared/MetricCard.module.css';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  /** A small picture of the same data, drawn on the right. */
  visual?: ReactNode;
  /** `danger` turns the value red; use it only for money that is really late. */
  tone?: 'default' | 'danger';
  onClick?: () => void;
}

/** One number with a hint and an optional picture of the same data (the Daftar Akun stat card). */
export const MetricCard = ({
  label,
  value,
  hint,
  visual,
  tone = 'default',
  onClick,
}: Readonly<MetricCardProps>) => {
  const content = (
    <>
      <div className={classes.text}>
        <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text
          className={classes.value}
          fz="var(--jurnal-text-2xl)"
          fw={700}
          c={tone === 'danger' ? 'red.7' : 'dark.9'}
          mt={4}
        >
          {value}
        </Text>
        {hint && (
          <Text className={classes.hint} fz="var(--jurnal-text-xs)" c="dimmed" mt={6}>
            {hint}
          </Text>
        )}
      </div>
      {visual && <div className={classes.visual}>{visual}</div>}
    </>
  );
  return onClick ? (
    <button type="button" className={classes.card} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={classes.card}>{content}</div>
  );
};

/** Four across on wide screens, two on tablets, one on phones. */
export const MetricGrid = ({
  children,
  columns = 4,
}: Readonly<{ children: ReactNode; columns?: 3 | 4 }>) => (
  <div className={classes.grid} data-columns={columns}>
    {children}
  </div>
);
