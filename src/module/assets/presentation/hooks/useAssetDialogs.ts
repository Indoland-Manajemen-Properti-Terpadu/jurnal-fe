import { useCallback, useState } from 'react';
import type { AssetItem } from '@/module/assets/domain/asset';

export type AssetDialog =
  | { kind: 'form'; asset: AssetItem | null }
  | { kind: 'activate'; asset: AssetItem }
  | { kind: 'revise'; asset: AssetItem }
  | { kind: 'dispose'; asset: AssetItem };

/** The one asset dialog that is open, shared by the list and the detail page. */
export const useAssetDialogs = () => {
  const [dialog, setDialog] = useState<AssetDialog | null>(null);
  const close = useCallback(() => setDialog(null), []);
  return { dialog, open: setDialog, close };
};
