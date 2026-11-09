import { Grid, MultiSelect, Stack, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { IconCalendar, IconTag } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import type { AssetFormValues, AssetTag } from '@/module/assets/domain/asset';
import type { AssetEditRights } from '@/module/assets/domain/assetRules';
import { MoneyInput } from '@/module/assets/presentation/components/MoneyInput';

export type AssetFormSectionProps = {
  form: UseFormReturnType<AssetFormValues>;
  rights: AssetEditRights;
  tags: AssetTag[];
};

export function AssetFormIdentitySection({ form, rights, tags }: Readonly<AssetFormSectionProps>) {
  const { t } = useTranslation('assets');

  return (
    <Stack gap="sm">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            label={t('code')}
            placeholder={t('codePlaceholder')}
            withAsterisk
            size="sm"
            disabled={!rights.terms}
            leftSection={<IconTag size={15} color="var(--mantine-color-dimmed)" />}
            {...form.getInputProps('code')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <TextInput
            label={t('name')}
            placeholder={t('namePlaceholder')}
            withAsterisk
            size="sm"
            disabled={!rights.details}
            {...form.getInputProps('name')}
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('categoryLabel')}
            placeholder={t('categoryPlaceholder')}
            size="sm"
            disabled={!rights.details}
            {...form.getInputProps('categoryName')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateInput
            label={t('acquisitionDateLabel')}
            placeholder={t('datePlaceholder')}
            valueFormat="DD/MM/YYYY"
            withAsterisk
            size="sm"
            disabled={!rights.terms}
            leftSection={<IconCalendar size={15} color="var(--mantine-color-dimmed)" />}
            value={form.values.acquisitionDate ? new Date(form.values.acquisitionDate) : null}
            onChange={(val) =>
              form.setFieldValue('acquisitionDate', val ? dayjs(val).format('YYYY-MM-DD') : '')
            }
            error={form.errors.acquisitionDate}
          />
        </Grid.Col>
      </Grid>

      <MoneyInput
        label={t('costLabel')}
        withAsterisk
        disabled={!rights.terms}
        value={form.values.acquisitionCost}
        onChange={(value) => form.setFieldValue('acquisitionCost', value)}
        error={form.errors.acquisitionCost}
      />

      <MultiSelect
        label={t('tagsLabel')}
        placeholder={tags.length > 0 ? t('tagsPlaceholder') : t('tagsNone')}
        data={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
        searchable
        clearable
        size="sm"
        disabled={!rights.tags}
        {...form.getInputProps('tagIds')}
      />

      <Textarea
        label={t('notesLabel')}
        placeholder={t('notesPlaceholder')}
        rows={2}
        size="sm"
        disabled={!rights.details}
        {...form.getInputProps('notes')}
      />
    </Stack>
  );
}

export default AssetFormIdentitySection;
