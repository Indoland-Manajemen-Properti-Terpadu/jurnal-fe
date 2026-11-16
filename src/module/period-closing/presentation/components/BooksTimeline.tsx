import { Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  buildBooksTimeline,
  type TimelineKind,
} from '@/module/period-closing/domain/booksTimeline';
import { formatDay, todayDay } from '@/module/period-closing/presentation/periodFormat';
import classes from './BooksTimeline.module.css';

interface BooksTimelineProps {
  closedThrough: string | undefined;
  lockedThrough: string | undefined;
}

const DOT: Record<TimelineKind, string> = {
  closed: classes.closed,
  locked: classes.locked,
  open: classes.open,
};

/** The books as one strip: closed, locked and open, with the date each part reaches. */
export function BooksTimeline({ closedThrough, lockedThrough }: Readonly<BooksTimelineProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const segments = buildBooksTimeline({ closedThrough, lockedThrough });
  const today = todayDay();

  const detail = (kind: TimelineKind, day: string | undefined): string => {
    if (kind === 'open') {
      if (!day) return t('timeline.openAll');
      return day > today
        ? t('timeline.openLater', { date: formatDay(day, currentLanguage) })
        : t('timeline.openFrom', { date: formatDay(day, currentLanguage) });
    }
    const key = kind === 'closed' ? 'timeline.closedUntil' : 'timeline.lockedUntil';
    return t(key, { date: day ? formatDay(day, currentLanguage) : '' });
  };

  return (
    <div>
      <ul className={classes.strip} aria-hidden="true">
        {segments.map(({ kind, weight }) => (
          <li
            key={kind}
            className={`${classes.bar} ${DOT[kind]}`}
            style={{ flexBasis: `calc(${weight}% - 4px)` }}
          >
            {kind === 'open' && <span className={classes.today} />}
          </li>
        ))}
      </ul>
      <ul className={classes.labels}>
        {segments.map(({ kind, weight, day }) => (
          <li key={kind} className={classes.label} style={{ flexBasis: `${weight}%` }}>
            <Text fz="sm" fw={600} c="dark.9">
              <span className={`${classes.dot} ${DOT[kind]}`} aria-hidden="true" />
              {t(`timeline.${kind}`)}
            </Text>
            <Text fz="xs" c="dimmed">
              {detail(kind, day)}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
