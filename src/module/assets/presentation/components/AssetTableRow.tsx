import { ActionIcon, Anchor, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { AssetItem } from '@/module/assets/domain/asset';
import {
  ASSET_STATUS_COLOR,
  ASSET_STATUS_LABEL_KEY,
} from '@/module/assets/presentation/components/assetStatusMeta';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import classes from '@/module/assets/presentation/components/AssetTable.module.css';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { useDecimalPrecision } from '@/module/settings';

export type AssetTableRowProps = {
  asset: AssetItem;
  onViewDetail: (asset: AssetItem) => void;
};

export function AssetTableRow({ asset, onViewDetail }: Readonly<AssetTableRowProps>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');

  return (
    <Table.Tr
      className={classes.row}
      onClick={(event) => {
        // The name link and the actions menu handle their own clicks.
        if ((event.target as HTMLElement).closest('a, button, [role="menuitem"]')) return;
        onViewDetail(asset);
      }}
    >
      <Table.Td className={classes.cell}>
        <Text size="sm" fw={500} className={classes.code} truncate maw={120} title={asset.code}>
          {asset.code}
        </Text>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Anchor
          component={Link}
          to={routes.assets.detail.replace(':id', asset.id)}
          size="sm"
          fw={500}
          className={classes.nameLink}
          title={asset.name}
        >
          {asset.name}
        </Anchor>
        <Text size="xs" c="dimmed">
          {t('boughtOn', { date: formatAssetDate(asset.acquisitionDate) })}
        </Text>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Text
          size="sm"
          c={asset.categoryName ? undefined : 'dimmed'}
          truncate
          maw={110}
          title={asset.categoryName ?? undefined}
        >
          {asset.categoryName ?? '—'}
        </Text>
      </Table.Td>

      <Table.Td className={`${classes.cell} ${classes.amount}`}>
        <Text size="sm">{formatAssetMoney(asset.acquisitionCost, precision)}</Text>
      </Table.Td>

      <Table.Td className={`${classes.cell} ${classes.amount}`}>
        <Text size="sm" fw={600}>
          {formatAssetMoney(asset.netBookValue, precision)}
        </Text>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Badge
          variant="light"
          color={ASSET_STATUS_COLOR[asset.status]}
          radius="sm"
          miw="max-content"
        >
          {t(ASSET_STATUS_LABEL_KEY[asset.status])}
        </Badge>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Group justify="center">
          <Tooltip label={t('viewFullDetail')} withArrow openDelay={300}>
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="md"
              aria-label={`${t('viewFullDetail')}: ${asset.name}`}
              onClick={() => onViewDetail(asset)}
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export default AssetTableRow;
