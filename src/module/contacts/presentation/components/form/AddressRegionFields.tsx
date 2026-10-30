import { useMemo } from 'react';
import { Grid, Select, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { ContactFormValues } from '@/module/contacts/domain/contact';
import {
  buildCityOptions,
  buildProvinceOptions,
  resolveCityChange,
  resolveProvinceChange,
} from '@/module/contacts/domain/contactRegion';

type Props = {
  form: UseFormReturnType<ContactFormValues>;
  kind: 'billing' | 'shipping';
};

/** Province, city and postal code of one address, with the province and city kept consistent. */
export function AddressRegionFields({ form, kind }: Readonly<Props>) {
  const { t } = useTranslation('contacts');
  const path = `addresses.${kind}.detail`;
  const { province, city } = form.values.addresses[kind].detail;

  const provinceOptions = useMemo(() => buildProvinceOptions(province), [province]);
  const cityOptions = useMemo(() => buildCityOptions(province, city), [province, city]);

  const handleProvinceChange = (value: string | null) => {
    const next = resolveProvinceChange(value, city);
    form.setFieldValue(`${path}.province`, next.province);
    if (next.city !== city) form.setFieldValue(`${path}.city`, next.city);
  };

  const handleCityChange = (value: string | null) => {
    const next = resolveCityChange(value, province);
    form.setFieldValue(`${path}.city`, next.city);
    if (next.province !== province) form.setFieldValue(`${path}.province`, next.province);
  };

  return (
    <Grid gutter="sm">
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Select
          label={t('form.address.province.label')}
          placeholder={t('form.address.province.placeholder')}
          data={provinceOptions}
          searchable
          clearable
          nothingFoundMessage={t('form.address.province.notFound')}
          value={province || null}
          onChange={handleProvinceChange}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Select
          label={t('form.address.city.label')}
          placeholder={
            province
              ? t('form.address.city.placeholderIn', { province })
              : t('form.address.city.placeholder')
          }
          data={cityOptions}
          searchable
          clearable
          nothingFoundMessage={t('form.address.city.notFound')}
          value={city || null}
          onChange={handleCityChange}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <TextInput
          label={t('form.address.zip.label')}
          placeholder={t('form.address.zip.placeholder')}
          maxLength={5}
          {...form.getInputProps(`${path}.zipCode`)}
        />
      </Grid.Col>
    </Grid>
  );
}
