import type { ReactNode } from 'react';
import { Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import classes from '@/module/inventory/presentation/components/metrics/MetricCard.module.css';

/** The figure shrinks with its card (down to 1rem) so a long rupiah amount stays on one line. */
const VALUE_SIZE = 'clamp(1rem, 7cqi, var(--jurnal-text-xl))';

interface MetricCardProps {
  icon: Icon;
  label: string;
  value: string;
  hint?: string;
  /** A thin picture of the same data at the foot of the card. */
  visual?: ReactNode;
  /** `warning` tints the icon orange; use it only for a real shortage. */
  tone?: 'default' | 'warning';
}

/** One figure: icon, label, value and a hint, with an optional bar of the same data underneath. */
export const MetricCard = ({
  icon: CardIcon,
  label,
  value,
  hint,
  visual,
  tone = 'default',
}: Readonly<MetricCardProps>) => (
  <div className={classes.cell}>
    <div className={classes.card}>
      <div className={classes.main}>
        <ThemeIcon
          size={40}
          radius="md"
          variant="light"
          color={tone === 'warning' ? 'orange' : 'primary'}
          style={{ flexShrink: 0 }}
        >
          <CardIcon size={20} stroke={1.8} />
        </ThemeIcon>
        <div className={classes.text}>
          <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={500}>
            {label}
          </Text>
          <Text
            className={classes.value}
            fw={700}
            c="dark.9"
            mt={2}
            style={{ fontSize: VALUE_SIZE }}
          >
            {value}
          </Text>
          {hint && (
            <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={4}>
              {hint}
            </Text>
          )}
        </div>
      </div>
      {visual && <div className={classes.visual}>{visual}</div>}
    </div>
  </div>
);

/** Three across on tablets and up (four on a wide screen when asked), one on phones. */
export const MetricGrid = ({
  children,
  columns = 3,
}: Readonly<{ children: ReactNode; columns?: 3 | 4 }>) => (
  <div className={classes.grid} data-columns={columns}>
    {children}
  </div>
);
