import type { AssetDialog } from '@/module/assets/presentation/hooks/useAssetDialogs';
import { AssetActivationModal } from '@/module/assets/presentation/components/AssetActivationModal';

/** Renders the open asset dialog; each dialog mounts fresh, so its form never keeps old values. */
export function AssetDialogs({
  dialog,
  onClose,
}: Readonly<{ dialog: AssetDialog | null; onClose: () => void }>) {
  if (!dialog) return null;
  switch (dialog.kind) {
    case 'activate':
      return <AssetActivationModal asset={dialog.asset} mode="activate" onClose={onClose} />;
    case 'revise':
      return <AssetActivationModal asset={dialog.asset} mode="revise" onClose={onClose} />;
  }
}

export default AssetDialogs;
