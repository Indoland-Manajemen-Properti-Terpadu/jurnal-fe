import type { ReactNode } from 'react';
import { Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import classes from '@/module/inventory/presentation/components/metrics/MetricCard.module.css';

/** The figure shrinks with its card (down to 1rem) so a long rupiah amount stays on one line. */
const VALUE_SIZE = 'clamp(1rem, 6.4cqi, var(--jurnal-text-xl))';

interface MetricCardProps {
  icon: Icon;
  label: string;
  value: string;
  hint?: string;
  /** A small picture of the same data, drawn on the right. */
  visual?: ReactNode;
  /** Wider picture area, for a bar with a legend under it. */
  wideVisual?: boolean;
  /** `warning` tints the icon orange; use it only for a real shortage. */
  tone?: 'default' | 'warning';
}

/** One number with an icon, a hint and an optional picture of the same data. */
export const MetricCard = ({
  icon: CardIcon,
  label,
  value,
  hint,
  visual,
  wideVisual,
  tone = 'default',
}: Readonly<MetricCardProps>) => (
  <div className={classes.cell}>
    <div className={classes.card} data-wide={wideVisual ? 'true' : undefined}>
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
      {visual && (
        <div className={classes.visual} data-wide={wideVisual ? 'true' : undefined}>
          {visual}
        </div>
      )}
    </div>
  </div>
);

/** Three across on tablets and up, one on phones. */
export const MetricGrid = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div className={classes.grid}>{children}</div>
);
