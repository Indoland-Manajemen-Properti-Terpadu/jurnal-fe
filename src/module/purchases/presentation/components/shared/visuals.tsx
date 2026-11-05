import { RingProgress, Text } from '@mantine/core';
import type { AgingBucketKey } from '@/module/purchases/domain/payablesView';
import classes from '@/module/purchases/presentation/components/shared/visuals.module.css';

/** Not yet due is brand blue; later buckets are one red hue getting stronger. */
export const AGING_COLOR: Record<AgingBucketKey, string> = {
  current: 'var(--mantine-color-primary-6)',
  days1to30: 'var(--mantine-color-red-3)',
  days31to60: 'var(--mantine-color-red-5)',
  days61to90: 'var(--mantine-color-red-7)',
  over90: 'var(--mantine-color-red-9)',
};

export interface BarSegment {
  key: string;
  value: number;
  color: string;
}

/** Flex-grow of each segment: its share of the positive total. Empty when nothing is positive. */
export const segmentGrow = (segments: BarSegment[]): { key: string; grow: number }[] => {
  const total = segments.reduce((sum, item) => sum + Math.max(item.value, 0), 0);
  if (total <= 0) return [];
  return segments
    .filter((item) => item.value > 0)
    .map((item) => ({ key: item.key, grow: item.value / total }));
};

interface SegmentBarProps {
  segments: BarSegment[];
  height?: 8 | 12;
  'aria-label': string;
}

/** One stacked bar. All zero draws the empty track. */
export const SegmentBar = ({
  segments,
  height = 8,
  'aria-label': ariaLabel,
}: Readonly<SegmentBarProps>) => {
  const grows = segmentGrow(segments);
  return (
    <div className={classes.bar} style={{ height }} role="img" aria-label={ariaLabel}>
      {grows.length === 0 ? (
        <span className={classes.track} />
      ) : (
        grows.map(({ key, grow }) => (
          <span
            key={key}
            className={classes.segment}
            style={{
              flexGrow: grow,
              background: segments.find((item) => item.key === key)?.color,
            }}
          />
        ))
      )}
    </div>
  );
};

export interface LegendItem {
  key: string;
  label: string;
  value: string;
  color: string;
}

export const Legend = ({
  items,
  layout = 'column',
}: Readonly<{ items: LegendItem[]; layout?: 'row' | 'column' }>) => (
  <div className={classes.legend} data-layout={layout}>
    {items.map((item) => (
      <span key={item.key} className={classes.legendRow}>
        <span className={classes.dot} style={{ background: item.color }} />
        {item.label}
        <b>{item.value}</b>
      </span>
    ))}
  </div>
);

/** Column chart: the peak is brand blue, the rest a soft tint. */
export const MiniBars = ({
  values,
  'aria-label': ariaLabel,
}: Readonly<{ values: number[]; 'aria-label': string }>) => {
  const peak = Math.max(...values, 0);
  return (
    <div className={classes.bars} role="img" aria-label={ariaLabel}>
      {values.map((value, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={classes.miniBar}
          data-peak={peak > 0 && value === peak}
          style={{ height: `${peak > 0 ? Math.max((value / peak) * 100, 7) : 7}%` }}
        />
      ))}
    </div>
  );
};

interface RingStatProps {
  percent: number;
  danger?: boolean;
  'aria-label': string;
}

export const RingStat = ({ percent, danger, 'aria-label': ariaLabel }: Readonly<RingStatProps>) => (
  <RingProgress
    size={64}
    thickness={7}
    roundCaps
    sections={[{ value: percent, color: danger ? 'red.6' : 'primary.6' }]}
    rootColor={danger ? 'var(--mantine-color-red-1)' : 'var(--mantine-color-primary-1)'}
    label={
      <Text ta="center" className={classes.percent} data-danger={danger ? 'true' : undefined}>
        {percent}%
      </Text>
    }
    aria-label={ariaLabel}
  />
);
