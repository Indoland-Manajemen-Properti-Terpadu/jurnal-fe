import type { ReactNode } from 'react';
import { Paper, Table } from '@mantine/core';
import classes from '@/module/inventory/presentation/components/warehouses/DataTableFrame.module.css';

type Props = {
  /** The table keeps this width and the frame scrolls sideways below it. */
  minWidth: number;
  /** Highlight a row under the pointer; leave it off for a table that is only read. */
  hover?: boolean;
  children: ReactNode;
};

/** The bordered card every warehouse table sits in: no gutter under the rows, no line after the last one. */
export function DataTableFrame({ minWidth, hover = true, children }: Readonly<Props>) {
  return (
    <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <div className={classes.scroll}>
        <Table
          className={classes.table}
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
