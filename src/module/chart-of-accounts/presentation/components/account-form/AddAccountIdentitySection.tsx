import React from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconChevronDown,
  IconFileInvoice,
  IconReceiptTax,
  IconRefresh,
  IconScale,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { UseFormReturnType } from '@mantine/form';
import type { CategoryAccountModel } from '@/module/chart-of-accounts/domain/categoryAccount';
import type { AccountFormValues } from '@/module/chart-of-accounts/domain/buildAccountPayload';
import { SYMMETRIC_INPUT_STYLES } from './accountFormStyles';
import { AccountPresetPicker } from './AccountPresetPicker';

const TAX_OPTIONS = [
  { value: 'PPN', label: 'PPN — Pajak Pertambahan Nilai' },
  { value: 'PPH', label: 'PPH — Pajak Penghasilan' },
  { value: 'PPNBM', label: 'PPNBM — Pajak Penjualan Barang Mewah' },
  { value: 'PBB', label: 'PBB — Pajak Bumi & Bangunan' },
];

interface AddAccountIdentitySectionProps {
  form: UseFormReturnType<AccountFormValues>;
  categoryOptions: { group: string; items: { value: string; label: string }[] }[];
  isLoadingCategories: boolean;
  suggestedAccountNumber?: string;
  hasSuggestedDiff: boolean;
  selectedCategoryObj?: CategoryAccountModel;
  isIncomeStatementCategory: boolean;
  applyPreset: (presetKey: string) => void;
}

/** Section 1: identity and classification. */
export const AddAccountIdentitySection: React.FC<AddAccountIdentitySectionProps> = ({
  form,
  categoryOptions,
  isLoadingCategories,
  suggestedAccountNumber,
  hasSuggestedDiff,
  selectedCategoryObj,
  isIncomeStatementCategory,
  applyPreset,
}) => {
  const { t } = useTranslation('journal');

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <IconFileInvoice size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={15} c="dark.8">
              {t('sec1Title')}
            </Text>
            <Text fz={12} c="dimmed">
              {t('sec1Subtitle')}
            </Text>
          </div>
        </Group>
        <Badge variant="light" color="primary" size="sm">
          Langkah 1 dari 3
        </Badge>
      </Group>

      <AccountPresetPicker onApply={applyPreset} />

      <Stack gap="md">
        {/* Row 1: 100% Symmetrical 2-Column Category & Account Code */}
        <Grid gutter="md" align="flex-start">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('fieldCategoryLabel')}
              description={t('fieldCategoryDesc')}
              placeholder={t('fieldCategoryPlaceholder')}
              data={categoryOptions}
              withAsterisk
              searchable
              clearable={false}
              disabled={isLoadingCategories}
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              {...form.getInputProps('category')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label={t('fieldCodeLabel')}
              description={t('fieldCodeDesc')}
              placeholder={t('fieldCodePlaceholder')}
              withAsterisk
              styles={SYMMETRIC_INPUT_STYLES}
              rightSectionWidth={hasSuggestedDiff ? 36 : undefined}
              rightSection={
                hasSuggestedDiff && suggestedAccountNumber ? (
                  <Tooltip
                    label={t('useSuggestedCode', {
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
          label={t('fieldNameLabel')}
          description={t('fieldNameDesc')}
          placeholder={t('fieldNamePlaceholder')}
          withAsterisk
          styles={SYMMETRIC_INPUT_STYLES}
          {...form.getInputProps('name')}
        />

        {/* Row 3: Symmetrical Equal-Height 2-Column Attribute Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {/* Attribute 1: Cash & Bank Module Integration */}
          <Paper
            withBorder
            radius="md"
            p="sm"
            h="100%"
            onClick={() => form.setFieldValue('isBankAndCash', !form.values.isBankAndCash)}
            bg={form.values.isBankAndCash ? 'cyan.0' : 'gray.0'}
            style={{
              cursor: 'pointer',
              borderColor: form.values.isBankAndCash ? 'var(--mantine-color-cyan-4)' : undefined,
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap" h="100%">
              <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon
                  size={32}
                  radius="md"
                  variant="light"
                  color={form.values.isBankAndCash ? 'cyan' : 'gray'}
                >
                  <IconBuildingBank size={17} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Group gap={6} wrap="wrap">
                    <Text fw={700} fz={13} c="dark.8">
                      {t('attrBankCashTitle')}
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={form.values.isBankAndCash ? 'cyan' : 'gray'}
                    >
                      {form.values.isBankAndCash ? t('badgeActive') : t('badgeInactive')}
                    </Badge>
                  </Group>
                  <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                    {t('attrBankCashDesc')}
                  </Text>
                </Box>
              </Group>
              <Checkbox
                color="cyan"
                size="sm"
                checked={form.values.isBankAndCash}
                onChange={(e) => form.setFieldValue('isBankAndCash', e.currentTarget.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </Group>
          </Paper>

          {/* Attribute 2: Contra Account Mode */}
          <Paper
            withBorder
            radius="md"
            p="sm"
            h="100%"
            onClick={() => form.setFieldValue('isContra', !form.values.isContra)}
            bg={form.values.isContra ? 'orange.0' : 'gray.0'}
            style={{
              cursor: 'pointer',
              borderColor: form.values.isContra ? 'var(--mantine-color-orange-4)' : undefined,
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap" h="100%">
              <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon
                  size={32}
                  radius="md"
                  variant="light"
                  color={form.values.isContra ? 'orange' : 'gray'}
                >
                  <IconScale size={17} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Group gap={6} wrap="wrap">
                    <Text fw={700} fz={13} c="dark.8">
                      {t('attrContraTitle')}
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={form.values.isContra ? 'orange' : 'gray'}
                    >
                      {form.values.isContra ? t('badgeActive') : t('badgeInactive')}
                    </Badge>
                  </Group>
                  <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                    {t('attrContraDesc')}
                  </Text>
                </Box>
              </Group>
              <Checkbox
                color="orange"
                size="sm"
                checked={form.values.isContra}
                onChange={(e) => form.setFieldValue('isContra', e.currentTarget.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </Group>
          </Paper>
        </SimpleGrid>

        {/* Row 4: 100% Symmetrical Tax & Financial Report Target */}
        <Grid gutter="md" align="flex-start">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('fieldTaxLabel')}
              description={t('fieldTaxDesc')}
              placeholder={t('fieldTaxPlaceholder')}
              data={TAX_OPTIONS}
              clearable
              leftSection={<IconReceiptTax size={16} />}
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              {...form.getInputProps('taxType')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label={t('fieldReportTargetLabel')}
              description={t('fieldReportTargetDesc')}
              value={
                selectedCategoryObj
                  ? isIncomeStatementCategory
                    ? t('stripReportIncomeStatement')
                    : t('stripReportBalanceSheet')
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
          label={t('fieldDescLabel')}
          placeholder={t('fieldDescPlaceholder')}
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
