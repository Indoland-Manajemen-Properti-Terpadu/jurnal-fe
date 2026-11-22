import { IconEye } from '@tabler/icons-react';
import type { RowAction } from '@/module/purchases/presentation/components/shared/ListShell';

/** "Lihat Rincian": every row can be opened from its menu, as in the reference web. */
export const viewAction = (label: string, onClick: () => void): RowAction => ({
  label,
  icon: <IconEye size={16} />,
  onClick,
});
