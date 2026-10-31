import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

/** The one primary action of the workspace; shown only to the custodian with voucher rights. */
export function RecordVoucherButton({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const access = usePettyCashAccess();

  const canRecord =
    fund.status === 'ACTIVE' &&
    access.can('JP-PC-VCH', 'create') &&
    access.isCustodianOf({
      custodianId: fund.custodian.id,
      singleUserOverride: fund.settings.singleUserOverride,
    });
  if (!canRecord) return null;

  return (
    <Button
      leftSection={<IconPlus size={16} />}
      onClick={() => navigate(routes.pettyCash.voucherAdd.replace(':fundId', fund.id))}
    >
      {t('actions.record')}
    </Button>
  );
}
