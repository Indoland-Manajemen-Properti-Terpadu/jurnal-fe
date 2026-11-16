import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconEdit, IconIdBadge2, IconNotes, IconPhoto, IconTool } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import type { AssetCondition, AssetItem } from '@/module/assets/domain/asset';
import { getAssetEditRights, getWarrantyStatus } from '@/module/assets/domain/assetRules';
import { AssetFact, AssetFactGrid } from '@/module/assets/presentation/components/AssetFacts';
import { AssetPhotoGallery } from '@/module/assets/presentation/components/AssetPhotoGallery';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';
import { useDecimalPrecision } from '@/module/settings';

const CONDITION_COLOR: Record<AssetCondition, string> = {
  new: 'teal',
  second: 'gray',
  refurbished: 'blue',
};

export type AssetOverviewPanelProps = {
  asset: AssetItem;
  /** Opens the edit form. */
  onEdit: () => void;
};

function WarrantyValue({ until }: Readonly<{ until?: string }>) {
  const { t } = useTranslation('assets');
  const status = getWarrantyStatus(until, dayjs().format('YYYY-MM-DD'));
  if (!until || !status) return null;
  const badge =
    status.state === 'expired'
      ? { color: 'gray', label: t('warrantyExpired') }
      : status.state === 'endingSoon'
        ? { color: 'orange', label: t('warrantyEndingSoon') }
        : { color: 'teal', label: t('warrantyMonthsLeft', { months: status.monthsLeft }) };
  return (
    <Group gap={6} wrap="wrap">
      <span>{formatAssetDate(until)}</span>
      <Badge size="sm" variant="light" color={badge.color} radius="sm" tt="none" fw={600}>
        {badge.label}
      </Badge>
    </Group>
  );
}

/** Main column of the "Detail Aset" tab, one card per topic: photos, general information, make and warranty, tags and notes. */
export function AssetOverviewPanel({ asset, onEdit }: Readonly<AssetOverviewPanelProps>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const editable = getAssetEditRights(asset).details;
  const fromProapps = asset.source === 'proapps';
  const hasSpecs = Boolean(
    asset.brand || asset.modelType || asset.serialNumber || asset.warrantyUntil
  );

  return (
    <Stack gap="lg">
      <AssetCard icon={IconPhoto} title={t('photosLabel')} subtitle={t('photosSub')}>
        <AssetPhotoGallery
          name={asset.name}
          photos={asset.photos}
          onAdd={editable ? onEdit : undefined}
          managedElsewhere={fromProapps}
        />
      </AssetCard>

      <AssetCard icon={IconIdBadge2} title={t('generalInfoTitle')} subtitle={t('identitySub')}>
        <AssetFactGrid>
          <AssetFact label={t('code')} value={asset.code} />
          <AssetFact label={t('category')} value={asset.categoryName} />
          <AssetFact label={t('acquisitionDate')} value={formatAssetDate(asset.acquisitionDate)} />
          <AssetFact
            label={t('acquisitionCost')}
            value={formatAssetMoney(asset.acquisitionCost, precision)}
            numeric
          />
          <AssetFact label={t('locationLabel')} value={asset.location} />
          <AssetFact
            label={t('conditionLabel')}
            value={
              asset.condition && (
                <Badge
                  size="md"
                  variant="light"
                  color={CONDITION_COLOR[asset.condition]}
                  radius="sm"
                  tt="none"
                  fw={600}
                >
                  {t(`condition_${asset.condition}`)}
                </Badge>
              )
            }
          />
          <AssetFact
            label={t('sourceLabel')}
            value={
              <>
                {fromProapps ? t('sourceProapps') : t('sourceJurnal')}
                {asset.syncError && (
                  <Text span fz="xs" fw={600} c="orange.8" display="block">
                    {t('syncPending')}
                  </Text>
                )}
              </>
            }
          />
        </AssetFactGrid>
      </AssetCard>

      <AssetCard icon={IconTool} title={t('specsTitle')} subtitle={t('specsSub')}>
        {hasSpecs ? (
          <AssetFactGrid>
            <AssetFact label={t('brandLabel')} value={asset.brand} />
            <AssetFact label={t('modelTypeLabel')} value={asset.modelType} />
            <AssetFact label={t('serialNumberLabel')} value={asset.serialNumber} />
            <AssetFact
              label={t('warrantyLabel')}
              value={<WarrantyValue until={asset.warrantyUntil} />}
            />
          </AssetFactGrid>
        ) : (
          <div className={classes.prompt}>
            <Text fz="sm" c="dimmed">
              {fromProapps ? t('specsEmptyProapps') : t('specsEmpty')}
            </Text>
            {editable && (
              <Button
                variant="default"
                size="xs"
                radius="md"
                leftSection={<IconEdit size={15} />}
                onClick={onEdit}
              >
                {t('specsAdd')}
              </Button>
            )}
          </div>
        )}
      </AssetCard>

      <AssetCard icon={IconNotes} title={t('otherInfoTitle')} subtitle={t('otherInfoSub')}>
        <AssetFactGrid>
          <AssetFact
            label={t('tagsLabel')}
            emptyText={t('noTags')}
            value={
              asset.tags.length > 0 && (
                <Group gap={6}>
                  {asset.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="light"
                      color="primary"
                      radius="sm"
                      tt="none"
                      fw={500}
                    >
                      {tag.name || tag.id}
                    </Badge>
                  ))}
                </Group>
              )
            }
          />
          <AssetFact
            label={t('assetNotes')}
            emptyText={t('noNotes')}
            value={asset.notes && <span style={{ whiteSpace: 'pre-line' }}>{asset.notes}</span>}
          />
        </AssetFactGrid>
      </AssetCard>
    </Stack>
  );
}

export default AssetOverviewPanel;
