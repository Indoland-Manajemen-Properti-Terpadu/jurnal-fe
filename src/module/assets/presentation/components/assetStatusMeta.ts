import type { AssetStatus } from '@/module/assets/domain/asset';

export const ASSET_STATUS_COLOR: Record<AssetStatus, string> = {
  pending: 'yellow',
  active: 'teal',
  fully_depreciated: 'gray',
  disposed: 'orange',
};

/** i18n keys (namespace `assets`) of the status labels. */
export const ASSET_STATUS_LABEL_KEY: Record<AssetStatus, string> = {
  pending: 'statusPending',
  active: 'statusActive',
  fully_depreciated: 'statusFullyDepreciated',
  disposed: 'statusDisposed',
};

export const ASSET_STATUS_ORDER: readonly AssetStatus[] = [
  'pending',
  'active',
  'fully_depreciated',
  'disposed',
];

/** Text colours for a status written in plain text rather than as a badge. */
export const ASSET_STATUS_TEXT_COLOR: Record<AssetStatus, string> = {
  pending: 'yellow.8',
  active: 'teal.8',
  fully_depreciated: 'gray.7',
  disposed: 'orange.8',
};
