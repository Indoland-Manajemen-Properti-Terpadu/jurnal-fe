import type { ReactNode } from 'react';
import { Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import type { StepState } from '@/module/petty-cash/domain/documentJourney';
import classes from '@/module/petty-cash/presentation/components/HistoryTimeline.module.css';

export interface TimelineEntry {
  id: string;
  title: ReactNode;
  /** ISO timestamp; absent for a stage that has not happened yet. */
  at?: string | null;
  by?: string | null;
  note?: string | null;
  /** Secondary line for a stage ahead (for example "Waiting for approval"). */
  hint?: string | null;
  state: StepState;
  refused?: boolean;
}

const stamp = (at: string) => dateFormatV1(at, 'DD MMM YYYY · HH:mm');

/**
 * One timeline for every document. Neutral markers for what happened, the brand color only for
 * the last step or the stage being waited for, hollow markers for stages ahead. A refusal is the
 * only step drawn differently (a cross), because it changes what the reader has to do.
 */
export function HistoryTimeline({ entries }: Readonly<{ entries: TimelineEntry[] }>) {
  const { t } = useTranslation('pettyCash');

  return (
    <ol className={classes.list}>
      {entries.map((entry, index) => {
        const next = entries[index + 1];
        const pending = entry.state === 'waiting' || entry.state === 'upcoming';
        return (
          <li key={entry.id} className={classes.item} data-next={next?.state}>
            <span
              className={classes.marker}
              data-state={entry.state}
              data-refused={entry.refused ? 'true' : undefined}
              aria-hidden
            >
              {!pending &&
                (entry.refused ? (
                  <IconX size={12} stroke={2.5} />
                ) : (
                  <IconCheck size={12} stroke={2.5} />
                ))}
            </span>
            <div className={classes.body}>
              {entry.at && (
                <Text size="xs" c="dimmed" lh={1.4}>
                  {stamp(entry.at)}
                </Text>
              )}
              <Text
                size="sm"
                fw={600}
                c={entry.state === 'upcoming' ? 'dimmed' : 'dark.8'}
                lh={1.4}
                component="div"
              >
                {entry.title}
              </Text>
              {(entry.by || entry.hint) && (
                <Text size="xs" c="dimmed" lh={1.5}>
                  {entry.by ? t('detail.by', { name: entry.by }) : entry.hint}
                </Text>
              )}
              {entry.note && (
                <Text size="sm" c="gray.7" mt={4} lh={1.5}>
                  “{entry.note}”
                </Text>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
