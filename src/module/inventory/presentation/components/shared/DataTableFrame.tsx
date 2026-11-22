import type { ReactNode } from 'react';
import { Paper, Table } from '@mantine/core';
import classes from '@/module/inventory/presentation/components/shared/DataTableFrame.module.css';

type Props = {
  /** The table keeps this width and the frame scrolls sideways below it. */
  minWidth: number;
  /** Highlight a row under the pointer; leave it off for a table that is only read. */
  hover?: boolean;
  /** Keep the first column in view while a wide table scrolls sideways. */
  stickyFirst?: boolean;
  /** Keep the last column (the value) in view too. */
  stickyLast?: boolean;
  children: ReactNode;
};

/** The bordered card every inventory table sits in: no gutter under the rows, no line after the last one. */
export function DataTableFrame({
  minWidth,
  hover = true,
  stickyFirst = false,
  stickyLast = false,
  children,
}: Readonly<Props>) {
  return (
    <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <div className={classes.scroll}>
        <Table
          className={classes.table}
          data-sticky-first={stickyFirst ? 'true' : undefined}
          data-sticky-last={stickyLast ? 'true' : undefined}
          style={{ minWidth }}
          verticalSpacing="sm"
          horizontalSpacing="sm"
          highlightOnHover={hover}
        >
          {children}
        </Table>
      </div>
    </Paper>
  );
}
