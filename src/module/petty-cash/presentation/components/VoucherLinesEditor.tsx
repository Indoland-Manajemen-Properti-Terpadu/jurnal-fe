import {
  ActionIcon,
  Button,
  Grid,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PettyCashLookups } from '@/module/petty-cash/domain/pettyCashEntities';
import {
  emptyLine,
  MAX_AMOUNT,
  type VoucherLineDraft,
} from '@/module/petty-cash/domain/voucherForm';

interface Props {
  lines: VoucherLineDraft[];
  lookups: PettyCashLookups | undefined;
  taxEnabled: boolean;
  errorFor: (path: string) => string | undefined;
  onChange: (lines: VoucherLineDraft[]) => void;
}

/** The expense lines of a voucher: account, amount, optional description and, with a tax invoice, a tax. */
export function VoucherLinesEditor({
  lines,
  lookups,
  taxEnabled,
  errorFor,
  onChange,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const update = (key: string, patch: Partial<VoucherLineDraft>) =>
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const accounts = (lookups?.expenseAccounts ?? []).map((account) => ({
    value: account.id,
    label: `${account.accountNumber} · ${account.name}`,
  }));
  const taxes = (lookups?.taxes ?? []).map((tax) => ({ value: tax.id, label: tax.name }));
  const tags = (lookups?.tags ?? []).map((tag) => ({ value: tag.id, label: tag.name }));

  return (
    <Stack gap="sm">
      {errorFor('lines') && (
        <Text size="sm" c="red.7" role="alert">
          {errorFor('lines')}
        </Text>
      )}
      {lines.map((line, index) => {
        const number = index + 1;
        return (
          <Paper key={line.key} withBorder radius="md" p="sm">
            <Grid gutter="sm" align="flex-start">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t('form.account')}
                  placeholder={t('form.accountPlaceholder')}
                  data={accounts}
                  value={line.expenseAccountId}
                  onChange={(value) => update(line.key, { expenseAccountId: value })}
                  error={errorFor(`lines.${index}.expenseAccountId`)}
                  searchable
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label={t('form.amount')}
                  placeholder="0"
                  prefix="Rp "
                  thousandSeparator="."
                  decimalSeparator=","
                  // A stored amount with cents is shown as is (and flagged), never rounded silently.
                  decimalScale={
                    typeof line.amount === 'number' && !Number.isInteger(line.amount) ? 2 : 0
                  }
                  allowNegative={false}
                  max={MAX_AMOUNT}
                  hideControls
                  value={line.amount}
                  onChange={(value) =>
                    update(line.key, { amount: typeof value === 'number' ? value : '' })
                  }
                  error={errorFor(`lines.${index}.amount`)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: taxEnabled ? 6 : 10 }}>
                <TextInput
                  label={t('form.lineDescription')}
                  value={line.description}
                  onChange={(event) => update(line.key, { description: event.currentTarget.value })}
                />
              </Grid.Col>
              {taxEnabled && (
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label={t('form.tax')}
                    placeholder={t('form.taxPlaceholder')}
                    data={taxes}
                    value={line.taxId}
                    onChange={(value) => update(line.key, { taxId: value })}
                    error={errorFor(`lines.${index}.taxId`)}
                    clearable
                  />
                </Grid.Col>
              )}
              <Grid.Col span={{ base: 12, sm: 2 }} style={{ alignSelf: 'flex-end' }}>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="lg"
                  disabled={lines.length === 1}
                  aria-label={t('form.removeLine', { number })}
                  onClick={() => onChange(lines.filter((item) => item.key !== line.key))}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Grid.Col>
              {tags.length > 0 && (
                <Grid.Col span={12}>
                  <MultiSelect
                    label={t('form.tags')}
                    description={t('form.tagsHint')}
                    placeholder={line.tagIds.length > 0 ? undefined : t('form.tagsPlaceholder')}
                    data={tags}
                    value={line.tagIds}
                    onChange={(tagIds) => update(line.key, { tagIds })}
                    clearable
                    searchable
                    clearButtonProps={{ 'aria-label': t('common.clearFilters') }}
                  />
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        );
      })}
      <Button
        variant="light"
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={() => onChange([...lines, emptyLine()])}
        style={{ alignSelf: 'flex-start' }}
      >
        {t('form.addLine')}
      </Button>
    </Stack>
  );
}
