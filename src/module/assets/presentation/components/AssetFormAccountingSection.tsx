import { Grid, Group, NumberInput, Paper, Select, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { DepreciationMethod } from '@/module/assets/domain/asset';
import { AssetFormSectionProps } from '@/module/assets/presentation/components/AssetFormIdentitySection';

export function AssetFormAccountingSection({ form }: Readonly<AssetFormSectionProps>) {
  const { t } = useTranslation('assets');
  const noDepreciation = form.values.depreciationMethod === 'none';

  return (
    <Paper withBorder radius="md" p="md" bg="gray.0">
      <Stack gap="sm">
        <Group gap="xs" mb={2}>
          <ThemeIcon size={24} radius="sm" variant="light" color="teal">
            <IconCash size={14} />
          </ThemeIcon>
          <Text size="xs" fw={700} tt="uppercase" c="teal.9" lts={0.5}>
            {t('sectionAccounting')}
          </Text>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              label={t('costLabel')}
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              min={0}
              required
              size="sm"
              {...form.getInputProps('acquisitionCost')}
            />
            <Text size="xs" c="dimmed" mt={4}>
              {t('costHint')}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              label={t('residualValue')}
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              min={0}
              disabled={noDepreciation}
              size="sm"
              {...form.getInputProps('residualValue')}
            />
            <Text size="xs" c="dimmed" mt={4}>
              {t('residualHint')}
            </Text>
          </Grid.Col>
        </Grid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('depreciationMethod')}
              data={[
                { value: 'straight_line', label: t('straightLine') },
                { value: 'double_declining', label: t('doubleDeclining') },
                { value: 'none', label: t('nonDepreciable') },
              ]}
              required
              size="sm"
              {...form.getInputProps('depreciationMethod')}
              onChange={(val) => {
                const method = (val as DepreciationMethod) || 'straight_line';
                form.setFieldValue('depreciationMethod', method);
                if (method === 'none') {
                  form.setFieldValue('usefulLifeYears', 0);
                  form.setFieldValue('residualValue', form.values.acquisitionCost);
                }
              }}
            />
            <Text size="xs" c="dimmed" mt={4}>
              {t('methodHint')}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              label={t('usefulLifeLabel')}
              suffix={` ${t('years')}`}
              min={noDepreciation ? 0 : 1}
              max={50}
              disabled={noDepreciation}
              size="sm"
              {...form.getInputProps('usefulLifeYears')}
            />
            <Text size="xs" c="dimmed" mt={4}>
              {t('usefulLifeHint')}
            </Text>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
}

export default AssetFormAccountingSection;
