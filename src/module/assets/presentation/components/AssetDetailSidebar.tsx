import { Anchor, Button, Group, Stack, Text } from '@mantine/core';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconListDetails,
  IconTruckDelivery,
  IconUserPlus,
} from '@tabler/icons-react';
import { Link, generatePath } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import type { AccountRef, AssetItem } from '@/module/assets/domain/asset';
import { getAssetEditRights } from '@/module/assets/domain/assetRules';
import { AssetFact, AssetFactGrid } from '@/module/assets/presentation/components/AssetFacts';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';

export type AssetDetailSidebarProps = {
  asset: AssetItem;
  /** Opens the edit form, where the vendor is chosen. */
  onEdit: () => void;
};

function VendorSection({ asset, onEdit }: Readonly<AssetDetailSidebarProps>) {
  const { t } = useTranslation('assets');
  const { vendor } = asset;
  const editable = getAssetEditRights(asset).details;

  return (
    <AssetCard
      icon={IconTruckDelivery}
      title={t('vendorLabel')}
      subtitle={t('vendorCardSub')}
      right={
        vendor && asset.vendorContactId ? (
          <Anchor
            component={Link}
            to={generatePath(routes.contacts.detail, { idAccount: asset.vendorContactId })}
            fz="xs"
            fw={600}
          >
            <Group gap={4} wrap="nowrap">
              {t('vendorOpenContact')}
              <IconArrowUpRight size={14} />
            </Group>
          </Anchor>
        ) : undefined
      }
    >
      {vendor ? (
        <AssetFactGrid single>
          <AssetFact label={t('vendorName')} value={vendor.name} />
          <AssetFact label={t('vendorPhone')} value={vendor.phone} />
          <AssetFact label={t('vendorEmail')} value={vendor.email} />
          <AssetFact label={t('vendorAddress')} value={vendor.address} />
        </AssetFactGrid>
      ) : (
        <div className={classes.prompt}>
          <Text fz="sm" c="dimmed">
            {asset.source === 'proapps' ? t('vendorEmptyProapps') : t('vendorEmpty')}
          </Text>
          {editable && (
            <Button
              variant="default"
              size="xs"
              radius="md"
              leftSection={<IconUserPlus size={15} />}
              onClick={onEdit}
            >
              {t('vendorChoose')}
            </Button>
          )}
        </div>
      )}
    </AssetCard>
  );
}

function AccountRow({ label, account }: Readonly<{ label: string; account: AccountRef | null }>) {
  const { t } = useTranslation('assets');
  return (
    <div className={classes.mappingRow} data-empty={account ? undefined : true}>
      <span className={classes.mappingArrow} aria-hidden="true">
        <IconArrowRight size={18} stroke={1.8} />
      </span>
      <div style={{ minWidth: 0 }}>
        <Text fz="xs" c="dimmed" fw={600}>
          {label}
        </Text>
        <Text
          fz="sm"
          fw={600}
          c={account ? 'dark.9' : 'dimmed'}
          style={{ overflowWrap: 'anywhere' }}
        >
          {account
            ? [account.accountNumber, account.name].filter(Boolean).join(' · ')
            : t('notFilled')}
        </Text>
      </div>
    </div>
  );
}

function AccountsSection({ asset }: Readonly<{ asset: AssetItem }>) {
  const { t } = useTranslation('assets');
  const rows: Array<[string, AccountRef | null]> = [
    [t('assetAccountLabel'), asset.assetAccount],
    [t('creditAccountLabel'), asset.creditAccount],
    ...(asset.depreciationMethod !== 'none'
      ? ([
          [t('accumAccountLabel'), asset.accumDeprAccount],
          [t('expenseAccountLabel'), asset.deprExpenseAccount],
        ] as Array<[string, AccountRef | null]>)
      : []),
    ...(asset.status === 'disposed'
      ? ([
          [t('proceedsAccountLabel'), asset.disposalProceedsAccount],
          [t('gainLossAccountLabel'), asset.disposalGainLossAccount],
        ] as Array<[string, AccountRef | null]>)
      : []),
  ];

  return (
    <AssetCard icon={IconListDetails} title={t('accountsTitle')} subtitle={t('accountsSub')}>
      {asset.status === 'pending' ? (
        <Text fz="sm" c="dimmed">
          {t('accountsPending')}
        </Text>
      ) : (
        <Stack gap="sm">
          {rows.map(([label, account]) => (
            <AccountRow key={label} label={label} account={account} />
          ))}
        </Stack>
      )}
    </AssetCard>
  );
}

/** Side column of the "Detail Aset" tab: the ledger accounts first, then the vendor. */
export function AssetDetailSidebar({ asset, onEdit }: Readonly<AssetDetailSidebarProps>) {
  return (
    <Stack gap="lg">
      <AccountsSection asset={asset} />
      <VendorSection asset={asset} onEdit={onEdit} />
    </Stack>
  );
}

export default AssetDetailSidebar;
