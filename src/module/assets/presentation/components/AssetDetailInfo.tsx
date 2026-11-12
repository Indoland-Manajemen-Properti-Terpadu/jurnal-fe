import { Stack, Text } from '@mantine/core';
import {
  IconAdjustmentsHorizontal,
  IconIdBadge2,
  IconListDetails,
  IconNotes,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountRef, AssetItem } from '@/module/assets/domain/asset';
import { isNonDepreciable } from '@/module/assets/domain/depreciation';
import {
  AssetInfoRow,
  AssetSectionCard,
} from '@/module/assets/presentation/components/AssetSectionCard';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { useDecimalPrecision } from '@/module/settings';

const METHOD_KEY = {
  straight_line: 'methodStraightLine',
  double_declining: 'methodDoubleDeclining',
  none: 'methodNone',
} as const;

function AccountRow({ label, account }: Readonly<{ label: string; account: AccountRef | null }>) {
  return (
    <AssetInfoRow label={label} muted={!account} stacked>
      {account ? (
        <Text size="sm" fw={600} c="dark.8" lh={1.3}>
          {account.accountNumber && account.name && (
            <>
              <Text span size="sm" fw={400} c="dimmed">
                {account.accountNumber}
              </Text>
              <Text span size="sm" fw={400} c="dimmed" aria-hidden>
                {' · '}
              </Text>
            </>
          )}
          <Text span inherit>
            {account.name || account.accountNumber}
          </Text>
        </Text>
      ) : (
        '—'
      )}
    </AssetInfoRow>
  );
}

/** What the asset is, one card per topic: identity, depreciation terms, accounts, tags and notes. */
export function AssetDetailInfo({ asset }: Readonly<{ asset: AssetItem }>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const pending = asset.status === 'pending';
  const notDepreciated = !pending && isNonDepreciable(asset);

  return (
    <Stack gap="lg">
      <AssetSectionCard
        icon={IconIdBadge2}
        title={t('sectionIdentity')}
        subtitle={t('identitySub')}
      >
        <AssetInfoRow label={t('category')} muted={!asset.categoryName}>
          {asset.categoryName ?? '—'}
        </AssetInfoRow>
        <AssetInfoRow label={t('acquisitionDate')}>
          {formatAssetDate(asset.acquisitionDate)}
        </AssetInfoRow>
        <AssetInfoRow label={t('sourceLabel')}>
          {asset.source === 'proapps' ? t('sourceProapps') : t('sourceJurnal')}
        </AssetInfoRow>
        {asset.syncError && (
          <AssetInfoRow label={t('syncLabel')}>
            <Text span size="sm" fw={600} c="orange.8">
              {t('syncPending')}
            </Text>
          </AssetInfoRow>
        )}
      </AssetSectionCard>

      <AssetSectionCard
        icon={IconAdjustmentsHorizontal}
        title={t('financialSummary')}
        subtitle={t('termsSub')}
      >
        <AssetInfoRow label={t('depreciationMethod')} muted={pending}>
          {pending ? t('notSetYet') : t(METHOD_KEY[asset.depreciationMethod])}
        </AssetInfoRow>
        <AssetInfoRow label={t('usefulLife')} muted={pending || notDepreciated}>
          {pending
            ? t('notSetYet')
            : notDepreciated
              ? t('noDepreciation')
              : t('yearsValue', { years: asset.usefulLifeYears })}
        </AssetInfoRow>
        <AssetInfoRow label={t('residualPlain')}>
          {formatAssetMoney(asset.residualValue, precision)}
        </AssetInfoRow>
        {asset.depreciationStartDate && (
          <AssetInfoRow label={t('startDateLabel')}>
            {formatAssetDate(asset.depreciationStartDate)}
          </AssetInfoRow>
        )}
        {asset.openingAccumulatedDepreciation > 0 && (
          <AssetInfoRow label={t('openingAccumLabel')}>
            {formatAssetMoney(asset.openingAccumulatedDepreciation, precision)}
          </AssetInfoRow>
        )}
      </AssetSectionCard>

      <AssetSectionCard
        icon={IconListDetails}
        title={t('accountsTitle')}
        subtitle={t('accountsSub')}
      >
        {pending ? (
          <Text size="sm" c="dimmed">
            {t('accountsPending')}
          </Text>
        ) : (
          <>
            <AccountRow label={t('assetAccountLabel')} account={asset.assetAccount} />
            <AccountRow label={t('creditAccountLabel')} account={asset.creditAccount} />
            {asset.depreciationMethod !== 'none' && (
              <>
                <AccountRow label={t('accumAccountLabel')} account={asset.accumDeprAccount} />
                <AccountRow label={t('expenseAccountLabel')} account={asset.deprExpenseAccount} />
              </>
            )}
            {asset.status === 'disposed' && (
              <>
                <AccountRow
                  label={t('proceedsAccountLabel')}
                  account={asset.disposalProceedsAccount}
                />
                <AccountRow
                  label={t('gainLossAccountLabel')}
                  account={asset.disposalGainLossAccount}
                />
              </>
            )}
          </>
        )}
      </AssetSectionCard>

      <AssetSectionCard icon={IconNotes} title={t('otherInfoTitle')} subtitle={t('otherInfoSub')}>
        <AssetInfoRow label={t('tagsLabel')} muted={asset.tags.length === 0}>
          {asset.tags.length ? asset.tags.map((tag) => tag.name || tag.id).join(', ') : '—'}
        </AssetInfoRow>
        <AssetInfoRow label={t('assetNotes')} muted={!asset.notes}>
          {asset.notes ?? '—'}
        </AssetInfoRow>
      </AssetSectionCard>
    </Stack>
  );
}

export default AssetDetailInfo;
