import { Divider, Group, Stack, Text } from '@mantine/core';
import classes from '@/module/purchases/presentation/components/shared/shared.module.css';

export interface MoneyRow {
  label: string;
  /** Already formatted. */
  amount: string;
  /** Prefixes the amount with a minus sign. */
  minus?: boolean;
  /** `total` adds a divider above and the large brand figure; `muted` dims the row. */
  emphasis?: 'total' | 'muted';
}

/** The money breakdown of any document: rows, dividers before totals, one emphasised figure. */
export const MoneyRows = ({ rows }: Readonly<{ rows: MoneyRow[] }>) => (
  <Stack gap="xs">
    {rows.map((row) => {
      const total = row.emphasis === 'total';
      const muted = row.emphasis === 'muted';
      return (
        <div key={row.label}>
          {total && <Divider mb="xs" />}
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Text fz="sm" fw={total ? 700 : 400} c={muted ? 'dimmed' : undefined}>
              {row.label}
            </Text>
            <Text
              className={classes.numeric}
              fz={total ? 'lg' : 'sm'}
              fw={total ? 700 : 500}
              c={total ? 'primary.8' : muted ? 'dimmed' : undefined}
            >
              {row.minus ? `- ${row.amount}` : row.amount}
            </Text>
          </Group>
        </div>
      );
    })}
  </Stack>
);
