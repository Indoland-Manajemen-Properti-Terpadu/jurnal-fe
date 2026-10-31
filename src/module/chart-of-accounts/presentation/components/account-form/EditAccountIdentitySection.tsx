import React from 'react';
import {
  ActionIcon,
  Badge,
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
import { IconChevronDown, IconFileInvoice, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { UseFormReturnType } from '@mantine/form';
import type { AccountFormValues } from '@/module/chart-of-accounts/domain/buildAccountPayload';

interface EditAccountIdentitySectionProps {
  form: UseFormReturnType<AccountFormValues>;
  categoryOptions: { value: string; label: string }[];
  isLocked: boolean;
  isLoadingCategories: boolean;
  suggestedAccountNumber?: string;
}

/** Card 1: main account information. */
export const EditAccountIdentitySection: React.FC<EditAccountIdentitySectionProps> = ({
  form,
  categoryOptions,
  isLocked,
  isLoadingCategories,
  suggestedAccountNumber,
}) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group gap="sm" mb="md">
        <ThemeIcon size={36} radius="md" variant="light" color="primary">
          <IconFileInvoice size={20} />
        </ThemeIcon>
        <div>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('edit.identityTitle')}
          </Text>
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('edit.identitySubtitle')}
          </Text>
        </div>
      </Group>

      <Stack gap="md">
        <TextInput
          label={t('form.fieldNameLabel')}
          placeholder={t('edit.namePlaceholder')}
          withAsterisk
          size="sm"
          {...form.getInputProps('name')}
        />

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.fieldCategoryLabel')}
              placeholder={t('edit.categoryPlaceholder')}
              data={categoryOptions}
              withAsterisk
              searchable
              clearable={false}
              disabled={isLocked || isLoadingCategories}
              rightSection={<IconChevronDown size={16} />}
              {...form.getInputProps('category')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label={t('edit.codeLabel')}
              placeholder={t('form.fieldCodePlaceholder')}
              withAsterisk
              rightSection={
                suggestedAccountNumber && suggestedAccountNumber !== form.values.accountNumber ? (
                  <Tooltip label={t('edit.useSuggestedCode', { code: suggestedAccountNumber })}>
                    <ActionIcon
                      variant="subtle"
                      color="primary"
                      size="sm"
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

        {/* Akun Kontra Box */}
        <Paper
          withBorder
          radius="md"
          p="sm"
          bg={form.values.isContra ? 'orange.0' : 'gray.0'}
          style={{
            borderColor: form.values.isContra ? 'var(--mantine-color-orange-3)' : undefined,
            transition: 'all 0.2s ease',
          }}
        >
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Group gap={6}>
                <Text fw={600} fz="var(--jurnal-text-sm)" c="dark.8">
                  {t('edit.contraTitle')}
                </Text>
                <Badge size="xs" variant="light" color={form.values.isContra ? 'orange' : 'gray'}>
                  {form.values.isContra ? t('form.badgeActive') : t('form.badgeInactive')}
                </Badge>
              </Group>
              <Text fz="var(--jurnal-text-xs)" c="dimmed">
                {t('edit.contraDesc')}
              </Text>
            </Stack>
            <Checkbox
              color="orange"
              size="md"
              {...form.getInputProps('isContra', { type: 'checkbox' })}
            />
          </Group>
        </Paper>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('edit.taxLabel')}
              placeholder={t('edit.taxPlaceholder')}
              data={['PPH', 'PPN', 'PPNBM', 'PBB']}
              clearable
              rightSection={<IconChevronDown size={16} />}
              {...form.getInputProps('taxType')}
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label={t('edit.descLabel')}
          placeholder={t('edit.descPlaceholder')}
          minRows={3}
          autosize
          {...form.getInputProps('desc')}
        />
      </Stack>
    </Paper>
  );
};
