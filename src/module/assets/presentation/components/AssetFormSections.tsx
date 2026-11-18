import { Grid, MultiSelect, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import { IconCalendar, IconTag } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import {
  ASSET_CONDITIONS,
  type AssetFormValues,
  type AssetItem,
  type AssetTag,
} from '@/module/assets/domain/asset';
import type { AssetEditRights } from '@/module/assets/domain/assetRules';
import { AssetVendorField } from '@/module/assets/presentation/components/AssetVendorField';
import { MoneyInput } from '@/module/assets/presentation/components/MoneyInput';

type FormProp = { form: UseFormReturnType<AssetFormValues> };

const calendarIcon = <IconCalendar size={15} color="var(--mantine-color-dimmed)" />;

/** Code, name, category, acquisition date and cost. */
export function AssetIdentityFields({
  form,
  rights,
}: Readonly<FormProp & { rights: AssetEditRights }>) {
  const { t } = useTranslation('assets');
  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <TextInput
          label={t('code')}
          placeholder={t('codePlaceholder')}
          withAsterisk
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
          disabled={!rights.details}
          {...form.getInputProps('name')}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label={t('categoryLabel')}
          placeholder={t('categoryPlaceholder')}
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
          maxDate={new Date()}
          disabled={!rights.terms}
          leftSection={calendarIcon}
          value={form.values.acquisitionDate ? new Date(form.values.acquisitionDate) : null}
          onChange={(val) =>
            form.setFieldValue('acquisitionDate', val ? dayjs(val).format('YYYY-MM-DD') : '')
          }
          error={form.errors.acquisitionDate}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <MoneyInput
          label={t('costLabel')}
          withAsterisk
          disabled={!rights.terms}
          value={form.values.acquisitionCost}
          onChange={(value) => form.setFieldValue('acquisitionCost', value)}
          error={form.errors.acquisitionCost}
        />
      </Grid.Col>
    </Grid>
  );
}

/** Brand, model, serial number, condition and warranty. */
export function AssetSpecFields({ form, editable }: Readonly<FormProp & { editable: boolean }>) {
  const { t } = useTranslation('assets');
  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput label={t('brandLabel')} disabled={!editable} {...form.getInputProps('brand')} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label={t('modelTypeLabel')}
          disabled={!editable}
          {...form.getInputProps('modelType')}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <TextInput
          label={t('serialNumberLabel')}
          disabled={!editable}
          {...form.getInputProps('serialNumber')}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Select
          label={t('conditionLabel')}
          placeholder={t('conditionPlaceholder')}
          data={ASSET_CONDITIONS.map((value) => ({ value, label: t(`condition_${value}`) }))}
          clearable
          disabled={!editable}
          value={form.values.condition || null}
          onChange={(next) =>
            form.setFieldValue('condition', (next ?? '') as AssetFormValues['condition'])
          }
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <DateInput
          label={t('warrantyLabel')}
          placeholder={t('datePlaceholder')}
          valueFormat="DD/MM/YYYY"
          clearable
          disabled={!editable}
          leftSection={calendarIcon}
          value={form.values.warrantyUntil ? new Date(form.values.warrantyUntil) : null}
          onChange={(val) =>
            form.setFieldValue('warrantyUntil', val ? dayjs(val).format('YYYY-MM-DD') : '')
          }
        />
      </Grid.Col>
    </Grid>
  );
}

/** Where the asset is and which supplier it came from. */
export function AssetPlaceFields({
  form,
  editable,
  asset,
}: Readonly<FormProp & { editable: boolean; asset?: AssetItem | null }>) {
  const { t } = useTranslation('assets');
  return (
    <Stack gap="md">
      <TextInput
        label={t('locationLabel')}
        placeholder={t('locationPlaceholder')}
        disabled={!editable}
        {...form.getInputProps('location')}
      />
      <AssetVendorField
        value={form.values.vendorContactId}
        onChange={(id) => form.setFieldValue('vendorContactId', id)}
        savedName={asset?.vendor?.name}
        locked={!editable}
        error={form.errors.vendorContactId as string | undefined}
      />
    </Stack>
  );
}

/** Free notes and the tags of the asset. */
export function AssetNotesFields({
  form,
  rights,
  tags,
}: Readonly<FormProp & { rights: AssetEditRights; tags: AssetTag[] }>) {
  const { t } = useTranslation('assets');
  return (
    <Stack gap="md">
      <Textarea
        label={t('notesLabel')}
        placeholder={t('notesPlaceholder')}
        autosize
        minRows={3}
        disabled={!rights.details}
        {...form.getInputProps('notes')}
      />
      <MultiSelect
        label={t('tagsLabel')}
        placeholder={tags.length > 0 ? t('tagsPlaceholder') : t('tagsNone')}
        data={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
        searchable
        clearable
        disabled={!rights.tags}
        {...form.getInputProps('tagIds')}
      />
    </Stack>
  );
}
