import { Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  buildBooksTimeline,
  type TimelineKind,
  type TimelineSegment,
} from '@/module/period-closing/domain/booksTimeline';
import type { DateRange } from '@/module/period-closing/domain/periodRules';
import { formatDay, todayDay } from '@/module/period-closing/presentation/periodFormat';
import classes from './BooksTimeline.module.css';

interface BooksTimelineProps {
  closedThrough: string | undefined;
  locks: readonly DateRange[];
}

const DOT: Record<TimelineKind, string> = {
  closed: classes.closed,
  locked: classes.locked,
  open: classes.open,
};

/** The books as one strip: closed, locked and open, with the dates each part covers. */
export function BooksTimeline({ closedThrough, locks }: Readonly<BooksTimelineProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const segments = buildBooksTimeline({ closedThrough, locks });
  const today = todayDay();
  const day = (value: string) => formatDay(value, currentLanguage);

  const detail = ({ kind, startDate, endDate }: TimelineSegment): string => {
    if (kind === 'closed') return t('timeline.closedUntil', { date: day(endDate ?? '') });
    if (kind === 'locked') {
      return t('timeline.lockedRange', { start: day(startDate ?? ''), end: day(endDate ?? '') });
    }
    if (endDate) {
      return startDate
        ? t('timeline.openRange', { start: day(startDate), end: day(endDate) })
        : t('timeline.openUntil', { date: day(endDate) });
    }
    if (!startDate) return t('timeline.openAll');
    return startDate > today
      ? t('timeline.openLater', { date: day(startDate) })
      : t('timeline.openFrom', { date: day(startDate) });
  };

  return (
    <div>
      <ul className={classes.strip} aria-hidden="true">
        {segments.map((segment, index) => (
          <li
            key={`${segment.kind}-${index}`}
            className={`${classes.bar} ${DOT[segment.kind]}`}
            style={{ flexBasis: `calc(${segment.weight}% - 4px)` }}
          >
            {segment.kind === 'open' && !segment.endDate && <span className={classes.today} />}
          </li>
        ))}
      </ul>
      <ul className={classes.labels}>
        {segments.map((segment, index) => (
          <li
            key={`${segment.kind}-${index}`}
            className={classes.label}
            style={{ flexBasis: `${segment.weight}%` }}
          >
            <Text fz="sm" fw={600} c="dark.9">
              <span className={`${classes.dot} ${DOT[segment.kind]}`} aria-hidden="true" />
              {t(`timeline.${segment.kind}`)}
            </Text>
            <Text fz="xs" c="dimmed">
              {detail(segment)}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
