import type { ReactNode } from 'react';
import { Text, ThemeIcon } from '@mantine/core';
import { IconChevronRight, type Icon } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import classes from '@/module/assets/presentation/components/WorkList.module.css';

export type WorkRowProps = {
  icon: Icon;
  /** Bold first part of the title, in the brand colour (a number or a name). */
  title: string;
  /** Rest of the title, dimmed, after a middle dot. */
  titleSuffix?: string;
  subtitle: ReactNode;
  /** Amount, time or a small action on the right. */
  side?: ReactNode;
  /** The whole row opens this page; without it the row is plain and `side` holds the action. */
  to?: string;
};

/** One row of a work list: icon, what and where, then an amount or action, as in purchasing. */
export function WorkRow({
  icon: RowIcon,
  title,
  titleSuffix,
  subtitle,
  side,
  to,
}: Readonly<WorkRowProps>) {
  const content = (
    <>
      <ThemeIcon variant="light" color="primary" size={32} radius="md">
        <RowIcon size={16} stroke={1.8} />
      </ThemeIcon>
      <div className={classes.main}>
        <Text size="sm" fw={500} c="primary.7" truncate>
          {title}
          {titleSuffix && (
            <Text span size="sm" c="dimmed" fw={400}>
              {' · '}
              {titleSuffix}
            </Text>
          )}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {subtitle}
        </Text>
      </div>
      {side && <div className={classes.side}>{side}</div>}
      {to && <IconChevronRight size={16} color="var(--mantine-color-dimmed)" aria-hidden />}
    </>
  );
  return to ? (
    <Link to={to} className={classes.row}>
      {content}
    </Link>
  ) : (
    <div className={classes.row}>{content}</div>
  );
}

export default WorkRow;
