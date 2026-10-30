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

const TAX_CODES = ['PPN', 'PPH', 'PPNBM', 'PBB'];

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
  const { t } = useTranslation('chartOfAccounts');
  const taxOptions = TAX_CODES.map((code) => ({ value: code, label: t(`form.tax${code}`) }));

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <IconFileInvoice size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={15} c="dark.8">
              {t('form.sec1Title')}
            </Text>
            <Text fz={12} c="dimmed">
              {t('form.sec1Subtitle')}
            </Text>
          </div>
        </Group>
        <Badge variant="light" color="primary" size="sm">
          {t('form.step1')}
        </Badge>
      </Group>

      <AccountPresetPicker onApply={applyPreset} />

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
              disabled={isLoadingCategories}
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
                      {t('form.attrBankCashTitle')}
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={form.values.isBankAndCash ? 'cyan' : 'gray'}
                    >
                      {form.values.isBankAndCash ? t('form.badgeActive') : t('form.badgeInactive')}
                    </Badge>
                  </Group>
                  <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                    {t('form.attrBankCashDesc')}
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
                      {t('form.attrContraTitle')}
                    </Text>
                    <Badge
                      size="xs"
                      variant="light"
                      color={form.values.isContra ? 'orange' : 'gray'}
                    >
                      {form.values.isContra ? t('form.badgeActive') : t('form.badgeInactive')}
                    </Badge>
                  </Group>
                  <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                    {t('form.attrContraDesc')}
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
