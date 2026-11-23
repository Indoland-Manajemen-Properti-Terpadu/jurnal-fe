import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { TransferStatus } from '@/module/inventory/domain/stockTransfer';

const COLOR: Record<TransferStatus, string> = {
  pending: 'yellow',
  posted: 'green',
  rejected: 'red',
  void: 'gray',
};

/** The state of a transfer in the list and on its page: asked for, done, refused or cancelled. */
export const TransferStatusBadge = ({ status }: Readonly<{ status: TransferStatus }>) => {
  const { t } = useTranslation('stockMovements');
  return (
    <Badge variant="light" color={COLOR[status]} size="sm">
      {t(`transfers.${status}`)}
    </Badge>
  );
};
