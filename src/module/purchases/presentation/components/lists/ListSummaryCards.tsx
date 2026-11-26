import { Paper, Text } from '@mantine/core';
import { IconFileText, type Icon } from '@tabler/icons-react';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import classes from './ListSummaryCards.module.css';

export interface SummaryCardItem {
  label: string;
  value: number;
  hint: string;
  money?: boolean;
  icon?: Icon;
}

export const ListSummaryCards = ({
  items,
  precision,
  icons,
}: Readonly<{ items: SummaryCardItem[]; precision?: number; icons?: readonly Icon[] }>) => (
  <div className={classes.grid}>
    {items.map((item, index) => {
      const CardIcon = item.icon ?? icons?.[index] ?? IconFileText;
      return (
        <Paper key={item.label} withBorder radius="md" p="md" className={classes.card}>
          <span className={classes.icon} aria-hidden>
            <CardIcon size={18} stroke={1.8} />
          </span>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            {item.label}
          </Text>
          <Text size="xl" fw={700} mt={5} className={classes.value}>
            {item.money ? formatAmount(item.value, precision) : item.value.toLocaleString('id-ID')}
          </Text>
          <Text size="xs" c="dimmed" mt={5}>
            {item.hint}
          </Text>
        </Paper>
      );
    })}
  </div>
);
