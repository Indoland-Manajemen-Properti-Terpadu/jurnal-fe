import { ActionIcon, Badge, Box, Group, Menu, Table, Text, ThemeIcon } from '@mantine/core';
import {
  IconCalendarStats,
  IconDots,
  IconEye,
  IconPencil,
  IconScale,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { AssetItem } from '@/module/assets/domain/asset';
import { depreciationPercent, toSafeNumber } from '@/module/assets/domain/depreciation';
import { getCategoryMeta } from '@/module/assets/presentation/components/assetCategoryMeta';
import { formatCurrency } from '@/utils/formatCurrency';

export type AssetTableRowProps = {
  asset: AssetItem;
  onViewSchedule: (asset: AssetItem) => void;
  onViewDetail?: (asset: AssetItem) => void;
  onEdit: (asset: AssetItem) => void;
  onDispose: (asset: AssetItem) => void;
  onDelete: (asset: AssetItem) => void;
};

function StatusBadge({ status }: Readonly<{ status: AssetItem['status'] }>) {
  const { t } = useTranslation('assets');
  if (status === 'active') {
    return (
      <Badge variant="light" color="teal" size="sm" radius="sm">
        {t('statusActive')}
      </Badge>
    );
  }
  if (status === 'fully_depreciated') {
    return (
      <Badge variant="filled" color="gray" size="sm" radius="sm">
        {t('statusFullyDepreciated')}
      </Badge>
    );
  }
  return (
    <Badge variant="light" color="orange" size="sm" radius="sm">
      {t('statusDisposed')}
    </Badge>
  );
}

export function AssetTableRow({
  asset,
  onViewSchedule,
  onViewDetail,
  onEdit,
  onDispose,
  onDelete,
}: Readonly<AssetTableRowProps>) {
  const { t } = useTranslation('assets');

  const { icon: CategoryIcon, listColor: color, labelKey } = getCategoryMeta(asset.category);
  const cost = toSafeNumber(asset.acquisitionCost);
  const nbv = toSafeNumber(asset.netBookValue);
  const depRatio = depreciationPercent(cost, toSafeNumber(asset.accumulatedDepreciation));

  return (
    <Table.Tr
      onClick={() => (onViewDetail ? onViewDetail(asset) : onViewSchedule(asset))}
      style={{ cursor: 'pointer', transition: 'background-color 150ms ease' }}
    >
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={38} radius="md" variant="light" color={color} style={{ flexShrink: 0 }}>
            <CategoryIcon size={18} stroke={1.8} />
          </ThemeIcon>

          <Box style={{ minWidth: 0 }}>
            <Text
              size="sm"
              fw={600}
              c="dark.8"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {asset.name}
            </Text>

            <Group gap={6} mt={2} align="center">
              <Badge
                size="xs"
                variant="outline"
                color="gray"
                radius="sm"
                ff="monospace"
                fw={600}
                styles={{ label: { textTransform: 'none' } }}
              >
                {asset.code}
              </Badge>

              {asset.notes && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  • {asset.notes}
                </Text>
              )}
            </Group>
          </Box>
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge variant="light" color={color} size="sm" radius="sm">
          {t(labelKey)}
        </Badge>
        <Text size="xs" c="dimmed" mt={4}>
          {t('boughtOn', { date: asset.acquisitionDate })}
        </Text>
      </Table.Td>

      <Table.Td style={{ textAlign: 'right' }}>
        <Text fw={700} size="sm" c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(cost)}
        </Text>
        <Text size="xs" c="dimmed">
          {t('residualInline', { value: formatCurrency(asset.residualValue) })}
        </Text>
      </Table.Td>

      <Table.Td style={{ textAlign: 'right' }}>
        <Text fw={800} size="sm" c="teal.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(nbv)}
        </Text>
        {asset.depreciationMethod !== 'none' ? (
          <Group gap={4} justify="flex-end" mt={2}>
            <Text size="xs" c="dimmed">
              {t('depreciatedInline', { percent: depRatio })}
            </Text>
          </Group>
        ) : (
          <Text size="xs" c="dimmed">
            {t('noDepreciation')}
          </Text>
        )}
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        <StatusBadge status={asset.status} />
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <Menu position="bottom-end" shadow="md" width={220} withArrow>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>{t('assetOptions')}</Menu.Label>

            {onViewDetail && (
              <Menu.Item leftSection={<IconEye size={15} />} onClick={() => onViewDetail(asset)}>
                {t('viewFullDetail')}
              </Menu.Item>
            )}

            <Menu.Item
              leftSection={<IconCalendarStats size={15} />}
              onClick={() => onViewSchedule(asset)}
            >
              {t('viewSchedule')}
            </Menu.Item>

            <Menu.Item leftSection={<IconPencil size={15} />} onClick={() => onEdit(asset)}>
              {t('editAsset')}
            </Menu.Item>

            {asset.status !== 'disposed' && (
              <Menu.Item leftSection={<IconScale size={15} />} onClick={() => onDispose(asset)}>
                {t('disposeAsset')}
              </Menu.Item>
            )}

            <Menu.Divider />

            <Menu.Item
              color="red"
              leftSection={<IconTrash size={15} />}
              onClick={() => onDelete(asset)}
            >
              {t('deleteAsset')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
}

export default AssetTableRow;
