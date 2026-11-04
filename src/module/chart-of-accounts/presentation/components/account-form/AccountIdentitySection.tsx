import React from 'react';
import {
  ActionIcon,
  Checkbox,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconFileInvoice, IconReceiptTax, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { UseFormReturnType } from '@mantine/form';
import type { CategoryAccountModel } from '@/module/chart-of-accounts/domain/categoryAccount';
import type { AccountFormValues } from '@/module/chart-of-accounts/domain/buildAccountPayload';
import { SYMMETRIC_INPUT_STYLES } from './accountFormStyles';
import { AccountPresetPicker } from './AccountPresetPicker';

const TAX_CODES = ['PPN', 'PPH', 'PPNBM', 'PBB'];

interface AccountIdentitySectionProps {
  form: UseFormReturnType<AccountFormValues>;
  categoryOptions: { group: string; items: { value: string; label: string }[] }[];
  isLoadingCategories: boolean;
  /** A locked account keeps its category. */
  categoryLocked?: boolean;
  suggestedAccountNumber?: string;
  hasSuggestedDiff: boolean;
  selectedCategoryObj?: CategoryAccountModel;
  isIncomeStatementCategory: boolean;
  /** Quick templates, offered only when creating an account. */
  applyPreset?: (presetKey: string) => void;
}

/** Section 1: identity and classification, shared by the add and edit pages. */
export const AccountIdentitySection: React.FC<AccountIdentitySectionProps> = ({
  form,
  categoryOptions,
  isLoadingCategories,
  categoryLocked = false,
  suggestedAccountNumber,
  hasSuggestedDiff,
  selectedCategoryObj,
  isIncomeStatementCategory,
  applyPreset,
}) => {
  const { t } = useTranslation('chartOfAccounts');
  const taxOptions = TAX_CODES.map((code) => ({ value: code, label: t(`form.tax${code}`) }));

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="none">
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <IconFileInvoice size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
              {t('form.sec1Title')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('form.sec1Subtitle')}
            </Text>
          </div>
        </Group>
      </Group>

      {applyPreset && <AccountPresetPicker onApply={applyPreset} />}

      <Stack gap="md">
        {/* Row 1: 100% Symmetrical 2-Column Category & Account Code */}
        <Grid gutter="md" align="flex-start">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.fieldCategoryLabel')}
              description={t('form.fieldCategoryDesc')}
              placeholder={t('form.fieldCategoryPlaceholder')}
              data={categoryOptions}
              withAsterisk
              searchable
              clearable={false}
              disabled={categoryLocked || isLoadingCategories}
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              {...form.getInputProps('category')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label={t('form.fieldCodeLabel')}
              description={t('form.fieldCodeDesc')}
              placeholder={t('form.fieldCodePlaceholder')}
              withAsterisk
              styles={SYMMETRIC_INPUT_STYLES}
              rightSectionWidth={hasSuggestedDiff ? 36 : undefined}
              rightSection={
                hasSuggestedDiff && suggestedAccountNumber ? (
                  <Tooltip
                    label={t('form.useSuggestedCode', {
                      code: suggestedAccountNumber,
                    })}
                  >
                    <ActionIcon
                      variant="light"
                      color="primary"
                      size="sm"
                      radius="sm"
                      onClick={() => form.setFieldValue('accountNumber', suggestedAccountNumber)}
                    >
                      <IconRefresh size={14} />
                    </ActionIcon>
                  </Tooltip>
                ) : null
              }
              {...form.getInputProps('accountNumber')}
            />
          </Grid.Col>
        </Grid>

        {/* Row 2: Full-Width Account Name */}
        <TextInput
          label={t('form.fieldNameLabel')}
          description={t('form.fieldNameDesc')}
          placeholder={t('form.fieldNamePlaceholder')}
          withAsterisk
          styles={SYMMETRIC_INPUT_STYLES}
          {...form.getInputProps('name')}
        />

        <Checkbox
          color="primary"
          label={t('form.attrContraTitle')}
          checked={form.values.isContra}
          onChange={(event) => form.setFieldValue('isContra', event.currentTarget.checked)}
        />

        {/* Tax and financial report target */}
        <Grid gutter="md" align="flex-start">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.fieldTaxLabel')}
              description={t('form.fieldTaxDesc')}
              placeholder={t('form.fieldTaxPlaceholder')}
              data={taxOptions}
              clearable
              leftSection={<IconReceiptTax size={16} />}
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              {...form.getInputProps('taxType')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label={t('form.fieldReportTargetLabel')}
              description={t('form.fieldReportTargetDesc')}
              value={
                selectedCategoryObj
                  ? isIncomeStatementCategory
                    ? t('form.stripReportIncomeStatement')
                    : t('form.stripReportBalanceSheet')
                  : '—'
              }
              readOnly
              leftSection={<IconFileInvoice size={16} />}
              styles={{
                ...SYMMETRIC_INPUT_STYLES,
                input: {
                  ...SYMMETRIC_INPUT_STYLES.input,
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  fontWeight: 600,
                  color: 'var(--mantine-color-dark-7)',
                },
              }}
            />
          </Grid.Col>
        </Grid>

        {/* Row 5: Description */}
        <Textarea
          label={t('form.fieldDescLabel')}
          placeholder={t('form.fieldDescPlaceholder')}
          minRows={3}
          autosize
          styles={{
            label: SYMMETRIC_INPUT_STYLES.label,
          }}
          {...form.getInputProps('desc')}
        />
      </Stack>
    </Paper>
  );
};
