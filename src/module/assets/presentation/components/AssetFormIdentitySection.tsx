import {
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { IconCalendar, IconTag } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import { AssetCategory, AssetFormValues } from '@/module/assets/domain/asset';

export type AssetFormSectionProps = {
  form: UseFormReturnType<AssetFormValues>;
};

export function AssetFormIdentitySection({ form }: Readonly<AssetFormSectionProps>) {
  const { t } = useTranslation('assets');

  return (
    <Paper withBorder radius="md" p="md" bg="gray.0">
      <Stack gap="sm">
        <Group gap="xs" mb={2}>
          <ThemeIcon size={24} radius="sm" variant="light" color="primary">
            <IconTag size={14} />
          </ThemeIcon>
          <Text size="xs" fw={700} tt="uppercase" c="primary.8" lts={0.5}>
            {t('sectionIdentity')}
          </Text>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextInput
              label={t('code')}
              placeholder={t('codePlaceholder')}
              required
              size="sm"
              leftSection={<IconTag size={15} color="var(--mantine-color-dimmed)" />}
              {...form.getInputProps('code')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 8 }}>
            <TextInput
              label={t('name')}
              placeholder={t('namePlaceholder')}
              required
              size="sm"
              {...form.getInputProps('name')}
            />
          </Grid.Col>
        </Grid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('categoryLabel')}
              data={[
                { value: 'vehicle', label: t('categoryVehicle') },
                { value: 'building', label: t('categoryBuilding') },
                { value: 'machinery', label: t('categoryMachinery') },
                { value: 'electronic', label: t('categoryElectronic') },
                { value: 'land', label: t('categoryLandNonDepreciable') },
              ]}
              required
              size="sm"
              {...form.getInputProps('category')}
              onChange={(val) => {
                form.setFieldValue('category', (val as AssetCategory) || 'vehicle');
                if (val === 'land') {
                  form.setFieldValue('depreciationMethod', 'none');
                  form.setFieldValue('usefulLifeYears', 0);
                  form.setFieldValue('residualValue', form.values.acquisitionCost);
                }
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DateInput
              label={t('acquisitionDateLabel')}
              placeholder={t('datePlaceholder')}
              valueFormat="DD/MM/YYYY"
              required
              size="sm"
              leftSection={<IconCalendar size={15} color="var(--mantine-color-dimmed)" />}
              value={form.values.acquisitionDate ? new Date(form.values.acquisitionDate) : null}
              onChange={(val) =>
                form.setFieldValue('acquisitionDate', val ? dayjs(val).format('YYYY-MM-DD') : '')
              }
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label={t('notesLabel')}
          placeholder={t('notesPlaceholder')}
          rows={2}
          size="sm"
          {...form.getInputProps('notes')}
        />
      </Stack>
    </Paper>
  );
}

export default AssetFormIdentitySection;
