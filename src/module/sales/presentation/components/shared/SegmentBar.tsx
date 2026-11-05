import { Tooltip } from '@mantine/core';
import classes from './visuals.module.css';

export interface BarSegment {
  key: string;
  label: string;
  value: number;
  /** A CSS colour from the theme scale, never a literal. */
  color: string;
  /** Shown on hover; defaults to the label. */
  tooltip?: string;
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
  /** Colour of the empty track drawn when every segment is zero. */
  trackColor: string;
  'aria-label': string;
}

/** One thin segmented bar: 8px, rounded ends, a 2px gap between parts, a tooltip on each part. */
export const SegmentBar = ({
  segments,
  trackColor,
  'aria-label': ariaLabel,
}: Readonly<SegmentBarProps>) => {
  const grows = segmentGrow(segments);
  return (
    <div className={classes.bar} role="img" aria-label={ariaLabel}>
      {grows.length === 0 ? (
        <span className={classes.track} style={{ background: trackColor }} />
      ) : (
        grows.map(({ key, grow }) => {
          const segment = segments.find((item) => item.key === key);
          return (
            <Tooltip key={key} label={segment?.tooltip ?? segment?.label} withArrow>
              <span
                className={classes.segment}
                style={{ flexGrow: grow, background: segment?.color }}
              />
            </Tooltip>
          );
        })
      )}
    </div>
  );
};
