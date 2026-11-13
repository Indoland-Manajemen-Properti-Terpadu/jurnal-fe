import { ActionIcon, Button, Grid, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

export interface LineRow {
  id: string;
  accountId: string;
  description: string;
  amount: number;
}

let sequence = 0;

export const createLineRow = (): LineRow => {
  sequence += 1;
  return {
    id: `line-${sequence}`,
    accountId: '',
    description: '',
    amount: 0,
  };
};

export interface LineLabels {
  account: string;
  accountPlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  amount: string;
}

/** The rows of account, note and amount shared by receive and send. At least one row always stays. */
export function AmountLinesEditor({
  rows,
  onChange,
  options,
  labels,
}: Readonly<{
  rows: LineRow[];
  onChange: (rows: LineRow[]) => void;
  options: { value: string; label: string }[];
  labels: LineLabels;
}>) {
  const { t } = useTranslation('bankCash');

  const update = (id: string, patch: Partial<LineRow>) =>
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <Stack gap="sm">
      {rows.map((row, index) => {
        const first = index === 0;
        return (
          <Grid key={row.id} columns={24} gutter="sm" align="flex-end">
            <Grid.Col span={{ base: 24, md: 10 }}>
              <Select
                label={first ? labels.account : undefined}
                aria-label={labels.account}
                placeholder={labels.accountPlaceholder}
                data={options}
                value={row.accountId || null}
                onChange={(value) => update(row.id, { accountId: value || '' })}
                searchable
                nothingFoundMessage={t('common.accountNotFound')}
                comboboxProps={{ shadow: 'md' }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 24, md: 7 }}>
              <TextInput
                label={first ? labels.description : undefined}
                aria-label={labels.description}
                placeholder={labels.descriptionPlaceholder}
                value={row.description}
                onChange={(event) => update(row.id, { description: event.currentTarget.value })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 20, md: 5 }}>
              <NumberInput
                label={first ? labels.amount : undefined}
                aria-label={labels.amount}
                placeholder="0"
                thousandSeparator="."
                decimalSeparator=","
                prefix="Rp "
                min={0}
                value={row.amount}
                onChange={(value) => update(row.id, { amount: Number(value) || 0 })}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, md: 2 }}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size={36}
                radius="md"
                disabled={rows.length <= 1}
                onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
                aria-label={t('form.removeLine')}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        );
      })}
      <div>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...rows, createLineRow()])}
        >
          {t('form.addLine')}
        </Button>
      </div>
    </Stack>
  );
}
