import { Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCalculator } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { DepreciationMethod } from '@/module/assets/domain/asset';
import { DepreciationEstimate, DepreciationResult } from '@/module/assets/domain/depreciation';

export type AssetFormPreviewProps = {
  method: DepreciationMethod;
  cost: number;
  estimate: DepreciationEstimate;
  preview: DepreciationResult;
};

type PreviewCellProps = {
  label: string;
  value: string;
  color: string;
};

function PreviewCell({ label, value, color }: Readonly<PreviewCellProps>) {
  return (
    <Paper withBorder radius="sm" p="xs" bg="white">
      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
        {label}
      </Text>
      <Text size="sm" fw={800} c={color} mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Paper>
  );
}

/** Live depreciation preview shown at the bottom of the asset form. */
export function AssetFormPreview({
  method,
  cost,
  estimate,
  preview,
}: Readonly<AssetFormPreviewProps>) {
  const { t } = useTranslation('assets');

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        background:
          'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-teal-0) 100%)',
        borderColor: 'var(--mantine-color-blue-2)',
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size={26} radius="sm" variant="filled" color="primary">
              <IconCalculator size={15} />
            </ThemeIcon>
            <Text size="xs" fw={700} c="primary.9">
              {t('previewTitle')}
            </Text>
          </Group>
          <Badge size="sm" variant="filled" color={method === 'none' ? 'gray' : 'teal'}>
            {method === 'none' ? t('noDepreciation') : t('previewReady')}
          </Badge>
        </Group>

        {method === 'none' ? (
          <Text size="xs" c="dimmed">
            {t('previewLandNote', { value: formatCurrency(cost) })}
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="xs">
            <PreviewCell
              label={t('annualDepreciation')}
              value={formatCurrency(estimate.annual)}
              color="dark.8"
            />
            <PreviewCell
              label={t('monthlyDepreciation')}
              value={formatCurrency(estimate.monthly)}
              color="dark.8"
            />
            <PreviewCell
              label={t('estimatedNbv')}
              value={formatCurrency(preview.netBookValue)}
              color="teal.8"
            />
          </SimpleGrid>
        )}
      </Stack>
    </Paper>
  );
}

export default AssetFormPreview;
