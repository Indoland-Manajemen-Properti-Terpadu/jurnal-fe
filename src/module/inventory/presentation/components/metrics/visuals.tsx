import { RingProgress, Text } from '@mantine/core';
import classes from '@/module/inventory/presentation/components/metrics/visuals.module.css';

export interface BarSegment {
  key: string;
  label: string;
  value: number;
  color: string;
  /** Text shown beside the label in the legend; defaults to the value. */
  display?: string;
}

/** Brand blue from strong to soft, so ranked slices read as one family. */
export const RANK_COLORS = [
  'var(--mantine-color-primary-8)',
  'var(--mantine-color-primary-5)',
  'var(--mantine-color-primary-3)',
  'var(--mantine-color-gray-4)',
] as const;

interface SegmentBarProps {
  segments: BarSegment[];
  'aria-label': string;
}

/** One stacked bar; with nothing to show it draws the empty track. */
export const SegmentBar = ({ segments, 'aria-label': ariaLabel }: Readonly<SegmentBarProps>) => {
  const filled = segments.filter((segment) => segment.value > 0);
  return (
    <div className={classes.bar} role="img" aria-label={ariaLabel}>
      {filled.length === 0 ? (
        <span className={classes.track} />
      ) : (
        filled.map((segment) => (
          <span
            key={segment.key}
            className={classes.segment}
            style={{ flexGrow: segment.value, background: segment.color }}
          />
        ))
      )}
    </div>
  );
};

/** What each colour means, with its figure; the bar is never the only way to read the data. */
export const Legend = ({ segments }: Readonly<{ segments: BarSegment[] }>) => (
  <div className={classes.legend}>
    {segments
      .filter((segment) => segment.value > 0)
      .map((segment) => (
        <span key={segment.key} className={classes.legendRow}>
          <span className={classes.dot} style={{ background: segment.color }} />
          <span className={classes.legendLabel}>{segment.label}</span>
          <b>{segment.display ?? String(segment.value)}</b>
        </span>
      ))}
  </div>
);

interface RingStatProps {
  percent: number;
  'aria-label': string;
}

export const RingStat = ({ percent, 'aria-label': ariaLabel }: Readonly<RingStatProps>) => (
  <RingProgress
    size={72}
    thickness={7}
    roundCaps
    sections={[{ value: percent, color: 'primary.6' }]}
    rootColor="var(--mantine-color-primary-1)"
    label={
      <Text ta="center" className={classes.percent}>
        {percent}%
      </Text>
    }
    aria-label={ariaLabel}
    style={{ alignSelf: 'center' }}
  />
);
