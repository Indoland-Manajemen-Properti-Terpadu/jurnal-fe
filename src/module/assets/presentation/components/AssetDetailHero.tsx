import {
  ActionIcon,
  Badge,
  Box,
  CopyButton,
  Grid,
  Group,
  Paper,
  Progress,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconCalendar, IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { AssetItem } from '@/module/assets/domain/asset';
import {
  depreciationPercent,
  isNonDepreciable,
  toSafeNumber,
} from '@/module/assets/domain/depreciation';
import { getCategoryMeta } from '@/module/assets/presentation/components/assetCategoryMeta';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';

export type AssetDetailHeroProps = {
  asset: AssetItem;
};

const STATUS_COLOR: Record<AssetItem['status'], string> = {
  active: 'teal',
  fully_depreciated: 'gray',
  disposed: 'orange',
};

const STATUS_LABEL_KEY: Record<AssetItem['status'], string> = {
  active: 'detailStatusActive',
  fully_depreciated: 'detailStatusFullyDepreciated',
  disposed: 'statusDisposed',
};

export function AssetDetailHero({ asset }: Readonly<AssetDetailHeroProps>) {
  const { t } = useTranslation('assets');
  const meta = getCategoryMeta(asset.category);
  const CategoryIcon = meta.icon;

  const cost = toSafeNumber(asset.acquisitionCost);
  const accum = toSafeNumber(asset.accumulatedDepreciation);
  const nbv = toSafeNumber(asset.netBookValue);
  const nonDepreciable = isNonDepreciable(asset);
  const depPercent = depreciationPercent(cost, accum);
  const remainingPercent = 100 - depPercent;

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Grid gutter="lg" align="center">
        <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
          <Group gap="md" align="flex-start" wrap="nowrap">
            <ThemeIcon
              size={56}
              radius="md"
              variant="light"
              color={meta.detailColor}
              style={{ flexShrink: 0 }}
            >
              <CategoryIcon size={28} />
            </ThemeIcon>

            <Box style={{ minWidth: 0 }}>
              <Group gap="xs" align="center" mb={6} wrap="wrap">
                <Title order={2} fz={{ base: 18, sm: 22 }} c="dark.9" fw={700}>
                  {asset.name}
                </Title>

                <CopyButton value={asset.code}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? t('copied') : t('copyCode')}>
                      <ActionIcon
                        variant="subtle"
                        color={copied ? 'teal' : 'gray'}
                        size="sm"
                        onClick={copy}
                      >
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>

                <Badge size="sm" variant="light" color={STATUS_COLOR[asset.status]}>
                  {t(STATUS_LABEL_KEY[asset.status])}
                </Badge>
              </Group>

              <Group gap="md" wrap="wrap">
                <Group gap={6} c="dimmed">
                  <IconCalendar size={14} />
                  <Text size="xs">
                    {t('acquiredShort')}:{' '}
                    <Text span fw={600} c="dark.7">
                      {formatAssetDate(asset.acquisitionDate)}
                    </Text>
                  </Text>
                </Group>

                <Text size="xs" c="gray.4">
                  •
                </Text>

                <Text size="xs" c="dimmed">
                  {t('category')}:{' '}
                  <Text span fw={600} c="dark.7">
                    {t(meta.detailLabelKey)}
                  </Text>
                </Text>

                <Text size="xs" c="gray.4">
                  •
                </Text>

                <Text size="xs" c="dimmed">
                  {t('codeShort')}:{' '}
                  <Text span ff="monospace" fw={600} c="dark.7">
                    {asset.code}
                  </Text>
                </Text>
              </Group>
            </Box>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
          <Paper
            withBorder
            radius="md"
            p="md"
            style={{
              backgroundColor: 'var(--mantine-color-gray-0)',
            }}
          >
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
              {t('netBookValue')}
            </Text>
            <Text fz={24} fw={800} c="teal.8" mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(nbv)}
            </Text>
            <Progress
              value={nonDepreciable ? 100 : remainingPercent}
              size="sm"
              radius="xl"
              color="teal.6"
              mt="xs"
            />
            <Group justify="space-between" mt={6}>
              <Text size="xs" c="dimmed">
                {nonDepreciable
                  ? t('nonDepreciableFull')
                  : t('depreciatedPercentLabel', { percent: depPercent })}
              </Text>
              <Text size="xs" fw={600} c="teal.7">
                {nonDepreciable
                  ? t('remainingFull')
                  : t('remainingPercentLabel', { percent: remainingPercent })}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

export default AssetDetailHero;
