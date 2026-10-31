import { Button, Tooltip } from '@mantine/core';
import { IconCash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { useReimbursements } from '@/module/petty-cash/presentation/hooks/useReplenishmentQueries';

/**
 * Start a replenishment request; shown to the custodian who has the replenishment right. A fund can
 * have one request in progress, so the button says so up front instead of after two steps.
 */
export function RequestReplenishmentButton({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const access = usePettyCashAccess();
  const active = useReimbursements({
    fundId: fund.id,
    status: ['SUBMITTED', 'APPROVED'],
    limit: 1,
  });

  const allowed =
    fund.status === 'ACTIVE' &&
    access.canRequestReplenishment({
      custodianId: fund.custodian.id,
      singleUserOverride: fund.settings.singleUserOverride,
    });
  if (!allowed) return null;

  const inProgress = (active.data?.totalResults ?? 0) > 0;

  return (
    <Tooltip label={t('replenishments.activeExists')} disabled={!inProgress} withArrow>
      <span>
        <Button
          variant={fund.balance.needsReplenishment ? 'filled' : 'light'}
          color={fund.balance.needsReplenishment ? 'orange' : 'primary'}
          leftSection={<IconCash size={16} />}
          disabled={inProgress}
          onClick={() => navigate(routes.pettyCash.replenishmentAdd.replace(':fundId', fund.id))}
        >
          {t('replenishments.request')}
        </Button>
      </span>
    </Tooltip>
  );
}
