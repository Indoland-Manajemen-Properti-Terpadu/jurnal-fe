import { Button } from '@mantine/core';
import { IconScale } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

/** Start a cash count; shown only to someone who may count cash and is not the custodian. */
export function RecordCountButton({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const access = usePettyCashAccess();

  if (fund.status !== 'ACTIVE' || !access.canCount({ custodianId: fund.custodian.id })) return null;

  return (
    <Button
      variant="light"
      leftSection={<IconScale size={16} />}
      onClick={() => navigate(routes.pettyCash.countAdd.replace(':fundId', fund.id))}
    >
      {t('counts.record')}
    </Button>
  );
}
