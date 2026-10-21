import { Group, Select, Stack, Text } from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';
import type { PettyCashFund } from '../types/pettyCash.types';

interface Props {
  funds: PettyCashFund[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function PettyCashFundSelector({ funds, value, onChange, label }: Props) {
  const selected = funds.find((fund) => fund.id === value);
  return (
    <Group gap="md" align="flex-end" wrap="wrap">
      <Select
        label={label}
        data={funds.map((fund) => ({ value: fund.id, label: fund.name }))}
        value={value}
        onChange={(next) => next && onChange(next)}
        leftSection={<IconBuilding size={16} />}
        allowDeselect={false}
        searchable
        w={{ base: '100%', sm: 360 }}
      />
      {selected && (
        <Stack gap={0} pb={2}>
          <Text size="xs" c="dimmed">
            {selected.code}
          </Text>
          <Text size="xs" c="dark.6">
            {selected.custodianName}
          </Text>
        </Stack>
      )}
    </Group>
  );
}
