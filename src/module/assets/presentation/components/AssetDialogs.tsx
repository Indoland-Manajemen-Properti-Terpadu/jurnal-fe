import type { AssetDialog } from '@/module/assets/presentation/hooks/useAssetDialogs';
import { AssetActivationModal } from '@/module/assets/presentation/components/AssetActivationModal';
import { AssetDisposalModal } from '@/module/assets/presentation/components/AssetDisposalModal';
import { AssetFormModal } from '@/module/assets/presentation/components/AssetFormModal';

/** Renders the open asset dialog; each dialog mounts fresh, so its form never keeps old values. */
export function AssetDialogs({
  dialog,
  onClose,
}: Readonly<{ dialog: AssetDialog | null; onClose: () => void }>) {
  if (!dialog) return null;
  switch (dialog.kind) {
    case 'form':
      return <AssetFormModal asset={dialog.asset} onClose={onClose} />;
    case 'activate':
      return <AssetActivationModal asset={dialog.asset} mode="activate" onClose={onClose} />;
    case 'revise':
      return <AssetActivationModal asset={dialog.asset} mode="revise" onClose={onClose} />;
    case 'dispose':
      return <AssetDisposalModal asset={dialog.asset} onClose={onClose} />;
  }
}

export default AssetDialogs;
