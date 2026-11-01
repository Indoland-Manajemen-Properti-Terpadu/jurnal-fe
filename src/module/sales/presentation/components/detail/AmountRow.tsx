import { Group, Text } from '@mantine/core';
import classes from './SaleDetail.module.css';

export function AmountRow({
  label,
  amount,
  emphasis = false,
  color,
}: {
  label: string;
  amount: string;
  emphasis?: boolean;
  color?: string;
}) {
  return (
    <Group
      justify="space-between"
      align="baseline"
      wrap="nowrap"
      gap="md"
      className={classes.amountRow}
    >
      <Text size="sm" fw={emphasis ? 700 : 500} c={emphasis ? 'primary.9' : 'dimmed'}>
        {label}
      </Text>
      <Text
        size={emphasis ? 'lg' : 'sm'}
        fw={emphasis ? 800 : 600}
        c={color || (emphasis ? 'primary.9' : undefined)}
        className={classes.amount}
      >
        {amount}
      </Text>
    </Group>
  );
}
