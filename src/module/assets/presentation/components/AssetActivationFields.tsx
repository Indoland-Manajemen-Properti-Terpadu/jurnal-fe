import {
  Box,
  Divider,
  Grid,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import { IconBook2, IconCalendar, IconTrendingDown } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import type { AccountOption, ActivationValues } from '@/module/assets/domain/asset';
import { previewAcquisitionJournal } from '@/module/assets/domain/assetRules';
import { estimateDepreciation } from '@/module/assets/domain/depreciation';
import { AccountSelect } from '@/module/assets/presentation/components/AccountSelect';
import { MoneyInput } from '@/module/assets/presentation/components/MoneyInput';
import { formatCurrency } from '@/utils/formatCurrency';

export type AssetActivationFieldsProps = {
  form: UseFormReturnType<ActivationValues>;
  accounts: AccountOption[];
  loadingAccounts?: boolean;
  acquisitionCost: number;
};

const ASSET_TYPES = ['Aktiva Tetap'];
const ACCUMULATION_TYPES = ['Depresiasi & Amortisasi'];
const EXPENSE_TYPES = ['Beban', 'Depresiasi & Amortisasi'];
const COUNTER_TYPES = ['Kas & Bank', 'Akun Hutang', 'Ekuitas'];

function SectionTitle({
  icon,
  title,
  hint,
}: Readonly<{ icon: React.ReactNode; title: string; hint?: string }>) {
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <ThemeIcon size={32} radius="md" variant="light" color="primary">
        {icon}
      </ThemeIcon>
      <Box>
        <Text fw={700} size="sm" c="dark.9" lh={1.3}>
          {title}
        </Text>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Box>
    </Group>
  );
}

function JournalPreview({
  form,
  accounts,
  cost,
}: Readonly<{
  form: UseFormReturnType<ActivationValues>;
  accounts: AccountOption[];
  cost: number;
}>) {
  const { t } = useTranslation('assets');
  const { values } = form;
  const name = (id: string, fallback: string) =>
    accounts.find((account) => account.id === id)?.name ?? fallback;
  const entry = previewAcquisitionJournal(values, cost);
  const estimate = estimateDepreciation(
    cost,
    values.residualValue,
    values.usefulLifeYears,
    values.depreciationMethod
  );

  const rows = [
    { label: name(values.assetAccount, t('previewAssetAccount')), debit: entry.asset, credit: 0 },
    ...(entry.accumulated > 0
      ? [
          {
            label: name(values.accumDeprAccount, t('previewAccumAccount')),
            debit: 0,
            credit: entry.accumulated,
          },
        ]
      : []),
    {
      label: name(values.creditAccount, t('previewCreditAccount')),
      debit: 0,
      credit: entry.counter,
    },
  ];

  return (
    <Paper withBorder radius="md" p="md" bg="gray.0">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5} mb="xs">
        {t('previewTitle')}
      </Text>
      <Stack gap={6}>
        {rows.map((row) => (
          <Group key={row.label} justify="space-between" wrap="nowrap" gap="md">
            <Text size="sm" c="dark.7" pl={row.credit > 0 ? 'md' : 0} lineClamp={1}>
              {row.label}
            </Text>
            <Text size="sm" fw={600} ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {row.debit > 0
                ? `${t('debit')} ${formatCurrency(row.debit)}`
                : `${t('credit')} ${formatCurrency(row.credit)}`}
            </Text>
          </Group>
        ))}
      </Stack>
      {values.depreciationMethod !== 'none' && estimate.monthly > 0 && (
        <>
          <Divider my="sm" />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5} mb={6}>
            {t('previewDepreciationTitle')}
          </Text>
          <Stack gap={4}>
            {[
              { key: 'previewYearly', amount: estimate.annual },
              { key: 'previewMonthly', amount: estimate.monthly },
            ].map((row) => (
              <Group key={row.key} justify="space-between" wrap="nowrap" gap="md">
                <Text size="sm" c="dimmed">
                  {t(row.key)}
                </Text>
                <Text size="sm" fw={600} ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(row.amount)}
                </Text>
              </Group>
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
}

/** Accounts and depreciation terms shared by activation, revision and add-and-activate. */
export function AssetActivationFields({
  form,
  accounts,
  loadingAccounts,
  acquisitionCost,
}: Readonly<AssetActivationFieldsProps>) {
  const { t } = useTranslation('assets');
  const { values } = form;
  const depreciated = values.depreciationMethod !== 'none';
  const taken = (own: keyof ActivationValues) =>
    (['assetAccount', 'creditAccount', 'accumDeprAccount', 'deprExpenseAccount'] as const)
      .filter((field) => field !== own)
      .map((field) => values[field])
      .filter(Boolean);

  const account = (
    field: 'assetAccount' | 'creditAccount' | 'accumDeprAccount' | 'deprExpenseAccount',
    label: string,
    description: string,
    preferred: string[],
    required: boolean
  ) => (
    <Grid.Col span={{ base: 12, sm: 6 }}>
      <AccountSelect
        label={label}
        description={description}
        placeholder={t('accountPlaceholder')}
        value={values[field]}
        onChange={(id) => form.setFieldValue(field, id)}
        options={accounts}
        preferredTypes={preferred}
        takenIds={taken(field)}
        error={form.errors[field] as string | undefined}
        required={required}
        loading={loadingAccounts}
      />
    </Grid.Col>
  );

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <SectionTitle
          icon={<IconBook2 size={18} />}
          title={t('sectionAccounts')}
          hint={t('sectionAccountsHint')}
        />
        <Grid gutter="md">
          {account(
            'assetAccount',
            t('assetAccountLabel'),
            t('assetAccountHint'),
            ASSET_TYPES,
            true
          )}
          {account(
            'creditAccount',
            t('creditAccountLabel'),
            t('creditAccountHint'),
            COUNTER_TYPES,
            true
          )}
          {depreciated &&
            account(
              'accumDeprAccount',
              t('accumAccountLabel'),
              t('accumAccountHint'),
              ACCUMULATION_TYPES,
              true
            )}
          {depreciated &&
            account(
              'deprExpenseAccount',
              t('expenseAccountLabel'),
              t('expenseAccountHint'),
              EXPENSE_TYPES,
              true
            )}
        </Grid>
      </Stack>

      <Stack gap="sm">
        <SectionTitle
          icon={<IconTrendingDown size={18} />}
          title={t('sectionDepreciation')}
          hint={t('sectionDepreciationHint')}
        />
        <SegmentedControl
          fullWidth
          size="sm"
          value={values.depreciationMethod}
          onChange={(method) =>
            form.setFieldValue(
              'depreciationMethod',
              method as ActivationValues['depreciationMethod']
            )
          }
          data={[
            { value: 'straight_line', label: t('methodStraightLine') },
            { value: 'double_declining', label: t('methodDoubleDeclining') },
            { value: 'none', label: t('methodNone') },
          ]}
        />
        {depreciated && (
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label={t('usefulLifeLabel')}
                description={t('usefulLifeHint')}
                suffix={` ${t('yearUnit')}`}
                placeholder={t('usefulLifePlaceholder')}
                allowNegative={false}
                allowDecimal={false}
                allowLeadingZeros={false}
                min={0}
                max={100}
                size="sm"
                withAsterisk
                value={values.usefulLifeYears || ''}
                onChange={(next) => form.setFieldValue('usefulLifeYears', Number(next) || 0)}
                error={form.errors.usefulLifeYears}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MoneyInput
                label={t('residualLabel')}
                description={t('residualHint')}
                value={values.residualValue}
                onChange={(value) => form.setFieldValue('residualValue', value)}
                error={form.errors.residualValue}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MoneyInput
                label={t('openingAccumLabel')}
                description={t('openingAccumHint')}
                value={values.accumulatedDepreciation}
                onChange={(value) => form.setFieldValue('accumulatedDepreciation', value)}
                error={form.errors.accumulatedDepreciation}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={t('startDateLabel')}
                description={t('startDateHint')}
                placeholder={t('datePlaceholder')}
                valueFormat="DD/MM/YYYY"
                clearable
                size="sm"
                leftSection={<IconCalendar size={15} color="var(--mantine-color-dimmed)" />}
                value={values.depreciationStartDate ? new Date(values.depreciationStartDate) : null}
                onChange={(date) =>
                  form.setFieldValue(
                    'depreciationStartDate',
                    date ? dayjs(date).format('YYYY-MM-DD') : ''
                  )
                }
              />
            </Grid.Col>
          </Grid>
        )}
      </Stack>

      <JournalPreview form={form} accounts={accounts} cost={acquisitionCost} />
    </Stack>
  );
}

export default AssetActivationFields;
