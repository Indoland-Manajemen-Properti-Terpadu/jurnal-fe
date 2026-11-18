import type { ReactNode } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import classes from '@/module/assets/presentation/components/StepTimeline.module.css';

/** done: happened; waiting: being waited for; upcoming: still ahead; refused: stopped here. */
export type StepState = 'done' | 'waiting' | 'upcoming' | 'refused';

export interface StepItem {
  id: string;
  state: StepState;
  children: ReactNode;
}

/** Vertical steps joined by a line, the same markers as the purchasing approvals. */
export function StepTimeline({ items }: Readonly<{ items: StepItem[] }>) {
  return (
    <ol className={classes.list}>
      {items.map((item, index) => (
        <li key={item.id} className={classes.item} data-next={items[index + 1]?.state}>
          <span
            className={classes.marker}
            data-state={item.state === 'refused' ? 'done' : item.state}
            data-refused={item.state === 'refused' || undefined}
            aria-hidden
          >
            {item.state === 'done' && <IconCheck size={12} stroke={2.5} />}
            {item.state === 'refused' && <IconX size={12} stroke={2.5} />}
          </span>
          <div className={classes.body}>{item.children}</div>
        </li>
      ))}
    </ol>
  );
}

export default StepTimeline;
