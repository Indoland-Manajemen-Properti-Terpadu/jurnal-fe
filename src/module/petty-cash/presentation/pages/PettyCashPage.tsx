import { Alert, Paper, Skeleton } from '@mantine/core';
import { IconCoins } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { FundSelector } from '@/module/petty-cash/presentation/components/FundSelector';
import { PettyCashWorkspace } from '@/module/petty-cash/presentation/components/PettyCashWorkspace';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { usePettyCashFunds } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import { PettyCashPageFrame } from '@/module/petty-cash/presentation/pages/PettyCashPageFrame';
import classes from '@/module/petty-cash/presentation/pages/PettyCashPage.module.css';

const FUND_PARAM = 'fund';

export default function PettyCashPage() {
  const { t } = useTranslation('pettyCash');
  const [params, setParams] = useSearchParams();
  const funds = usePettyCashFunds({ limit: 100, sortBy: 'code:asc' });
  const items = funds.data?.items ?? [];
  const selected =
    items.find((fund) => fund.id === params.get(FUND_PARAM)) ??
    items.find((fund) => fund.status === 'ACTIVE') ??
    items[0];

  return (
    <PettyCashPageFrame>
      <ModuleHeader
        icon={IconCoins}
        title={t('workspace.title')}
        description={t('workspace.subtitle')}
      />

      {funds.isLoading && <Skeleton height={240} radius="lg" />}

      {funds.isError && (
        <QueryErrorState
          title={t('workspace.loadFailed')}
          error={funds.error}
          onRetry={() => funds.refetch()}
        />
      )}

      {funds.data && items.length === 0 && (
        <Paper withBorder radius="lg" bg="white">
          <EmptyState
            icon={<IconCoins size={32} />}
            title={t('workspace.noFunds')}
            description={t('workspace.noFundsDescription')}
          />
        </Paper>
      )}

      {selected && (
        <>
          {funds.data && funds.data.totalResults > items.length && (
            <Alert variant="light" color="orange" radius="md">
              {t('workspace.fundsTruncated', {
                shown: items.length,
                total: funds.data.totalResults,
              })}
            </Alert>
          )}
          <Paper className={classes.toolbar} radius="lg" p="md">
            <FundSelector
              funds={items}
              value={selected.id}
              onChange={(fundId) => setParams({ [FUND_PARAM]: fundId }, { replace: true })}
            />
          </Paper>
          <PettyCashWorkspace key={selected.id} fund={selected} />
        </>
      )}
    </PettyCashPageFrame>
  );
}
