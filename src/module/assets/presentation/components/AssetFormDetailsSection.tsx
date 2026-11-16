import { Grid, Select, Stack, TagsInput, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';
import { IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import {
  ASSET_CONDITIONS,
  MAX_ASSET_PHOTOS,
  type AssetFormValues,
  type AssetItem,
} from '@/module/assets/domain/asset';
import { AssetVendorField } from '@/module/assets/presentation/components/AssetVendorField';

export type AssetFormDetailsSectionProps = {
  form: UseFormReturnType<AssetFormValues>;
  /** Whether these details can be changed; ProApps assets keep them in ProApps. */
  editable: boolean;
  /** The asset being edited, for the saved vendor name. */
  asset?: AssetItem | null;
};

/** Optional facts about the asset: make and model, warranty, condition, place, vendor and photos. */
export function AssetFormDetailsSection({
  form,
  editable,
  asset,
}: Readonly<AssetFormDetailsSectionProps>) {
  const { t } = useTranslation('assets');

  return (
    <Stack gap="sm">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('brandLabel')}
            size="sm"
            disabled={!editable}
            {...form.getInputProps('brand')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('modelTypeLabel')}
            size="sm"
            disabled={!editable}
            {...form.getInputProps('modelType')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('serialNumberLabel')}
            size="sm"
            disabled={!editable}
            {...form.getInputProps('serialNumber')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('locationLabel')}
            placeholder={t('locationPlaceholder')}
            size="sm"
            disabled={!editable}
            {...form.getInputProps('location')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label={t('conditionLabel')}
            placeholder={t('conditionPlaceholder')}
            data={ASSET_CONDITIONS.map((value) => ({ value, label: t(`condition_${value}`) }))}
            clearable
            size="sm"
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
            size="sm"
            disabled={!editable}
            leftSection={<IconCalendar size={15} color="var(--mantine-color-dimmed)" />}
            value={form.values.warrantyUntil ? new Date(form.values.warrantyUntil) : null}
            onChange={(val) =>
              form.setFieldValue('warrantyUntil', val ? dayjs(val).format('YYYY-MM-DD') : '')
            }
          />
        </Grid.Col>
      </Grid>

      <AssetVendorField
        value={form.values.vendorContactId}
        onChange={(id) => form.setFieldValue('vendorContactId', id)}
        savedName={asset?.vendor?.name}
        locked={!editable}
        error={form.errors.vendorContactId as string | undefined}
      />

      <TagsInput
        label={t('photosLabel')}
        description={t('photosHint', { max: MAX_ASSET_PHOTOS })}
        placeholder={t('photosPlaceholder')}
        size="sm"
        disabled={!editable}
        clearable
        splitChars={[' ', ',']}
        {...form.getInputProps('photos')}
      />
    </Stack>
  );
}

export default AssetFormDetailsSection;
