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
            title={`${segment.label}: ${segment.display ?? segment.value}`}
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
          <span className={classes.legendLabel} title={segment.label}>
            {segment.label}
          </span>
          <b>{segment.display ?? String(segment.value)}</b>
        </span>
      ))}
  </div>
);

interface PercentBarProps {
  percent: number;
  /** "89% berstok": what the filled part means, shown under the bar. */
  caption: string;
  color?: string;
}

/** A share of a whole as one bar with its percent written out; the bar is never the only reading. */
export const PercentBar = ({
  percent,
  caption,
  color = 'var(--mantine-color-primary-6)',
}: Readonly<PercentBarProps>) => (
  <>
    <div className={classes.bar} role="img" aria-label={caption}>
      <span className={classes.track}>
        <span className={classes.fill} style={{ width: `${percent}%`, background: color }} />
      </span>
    </div>
    <span className={classes.caption}>{caption}</span>
  </>
);

interface ShareBarProps {
  segments: BarSegment[];
  /** One line that reads the bar: "Terbesar: Uji Kertas A4 (31%)". */
  caption: string;
  'aria-label': string;
}

/** A stacked bar with one line of reading under it; each slice names itself on hover. */
export const ShareBar = ({
  segments,
  caption,
  'aria-label': ariaLabel,
}: Readonly<ShareBarProps>) => (
  <>
    <SegmentBar segments={segments} aria-label={ariaLabel} />
    <span className={classes.caption}>{caption}</span>
  </>
);
