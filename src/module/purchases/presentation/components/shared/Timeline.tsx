import type { ReactNode } from 'react';
import { IconCheck } from '@tabler/icons-react';
import classes from '@/module/purchases/presentation/components/shared/Timeline.module.css';

/** done: happened; latest: the one on screen; waiting: being waited for; upcoming: still ahead. */
export type TimelineState = 'done' | 'latest' | 'waiting' | 'upcoming';

export interface TimelineItem {
  id: string;
  state: TimelineState;
  children: ReactNode;
}

/** Vertical steps joined by a line. Neutral markers for what exists, brand color for the focus. */
export const Timeline = ({ items }: Readonly<{ items: TimelineItem[] }>) => (
  <ol className={classes.list}>
    {items.map((item, index) => (
      <li key={item.id} className={classes.item} data-next={items[index + 1]?.state}>
        <span className={classes.marker} data-state={item.state} aria-hidden>
          {(item.state === 'done' || item.state === 'latest') && (
            <IconCheck size={12} stroke={2.5} />
          )}
        </span>
        <div className={classes.body}>{item.children}</div>
      </li>
    ))}
  </ol>
);
