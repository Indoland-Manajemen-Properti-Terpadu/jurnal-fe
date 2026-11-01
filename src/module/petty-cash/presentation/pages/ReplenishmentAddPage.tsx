import { Button, Paper, Skeleton, Text } from '@mantine/core';
import { IconArrowLeft, IconCash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { isValidObjectId } from '@/module/petty-cash/domain/pettyCashView';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { ReplenishmentWizard } from '@/module/petty-cash/presentation/components/ReplenishmentWizard';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { usePettyCashFund } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import { PettyCashPageFrame } from '@/module/petty-cash/presentation/pages/PettyCashPageFrame';

export default function ReplenishmentAddPage() {
  const { fundId } = useParams<{ fundId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const validId = isValidObjectId(fundId);
  const query = usePettyCashFund(fundId, validId);
  const fund = query.data;
  const back = () => navigate(`${routes.pettyCash.main}?fund=${fundId ?? ''}&tab=replenishments`);

  const allowed =
    fund !== undefined &&
    fund.status === 'ACTIVE' &&
    access.canRequestReplenishment({
      custodianId: fund.custodian.id,
      singleUserOverride: fund.settings.singleUserOverride,
    });
  const loading = (validId && query.isLoading) || access.isLoading;

  return (
    <PettyCashPageFrame>
      <ModuleHeader
        icon={IconCash}
        title={t('replenishForm.title')}
        description={t('replenishForm.subtitle')}
        actions={
          <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
            {t('common.back')}
          </Button>
        }
      />

      {loading && <Skeleton height={320} radius="lg" />}

      {!validId && (
        <Paper withBorder radius="lg" p="xl" ta="center" maw={680} mx="auto">
          <Text fw={700}>{t('workspace.invalidFundId')}</Text>
        </Paper>
      )}

      {validId && query.isError && (
        <QueryErrorState
          title={t('workspace.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}
      {access.isError && (
        <QueryErrorState
          title={t('workspace.loadFailed')}
          error={access.error}
          onRetry={() => access.refetch()}
        />
      )}

      {!loading && fund && !access.isError && !allowed && (
        <Paper withBorder radius="lg" p="xl" ta="center" maw={680} mx="auto">
          <Text fw={700}>{t('replenishForm.notAllowedTitle')}</Text>
          <Text c="dimmed" mt="xs">
            {fund.status === 'ACTIVE' ? t('replenishForm.notAllowedBody') : t('form.fundInactive')}
          </Text>
        </Paper>
      )}

      {!loading && fund && allowed && <ReplenishmentWizard key={fund.id} fund={fund} />}
    </PettyCashPageFrame>
  );
}
