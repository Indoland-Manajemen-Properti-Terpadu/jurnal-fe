import { ActionIcon, Button, Paper, Skeleton, Stack, Tooltip } from '@mantine/core';
import {
  IconChartBar,
  IconLock,
  IconPlus,
  IconRefresh,
  IconShoppingCart,
} from '@tabler/icons-react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  resolveTab,
  visibleTabs,
  type HubTab,
} from '@/module/purchases/presentation/components/hub/hubTabs';
import { OverviewMetrics } from '@/module/purchases/presentation/components/hub/OverviewMetrics';
import { useOverviewData } from '@/module/purchases/presentation/components/hub/useOverviewData';
import { PurchasesTabs } from '@/module/purchases/presentation/components/hub/PurchasesTabs';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';
import { routes } from '@/router/routes';

const TAB_PARAM = 'tab';

export default function PurchasesPage() {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const access = usePurchaseAccess();
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const fetching = useIsFetching({ queryKey: purchaseKeys.all(scope) }) > 0;

  const overview = useOverviewData(access.can);
  const canReport = access.can(PURCHASE_MENU.reports, 'read');
  const openReport = () => navigate(routes.purchases.payables);
  const visible = visibleTabs(access.can);
  const active = resolveTab(params.get(TAB_PARAM), access.can);

  const changeTab = (tab: HubTab) => setParams({ [TAB_PARAM]: tab }, { replace: true });
  const refresh = () => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });

  const body = () => {
    if (access.isLoading) {
      return (
        <Stack gap="md">
          <Skeleton height={36} radius="md" />
          <Skeleton height={220} radius="md" />
        </Stack>
      );
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          icon={<IconLock size={32} stroke={1.6} />}
          title={t('hub.noAccessTitle')}
          description={t('hub.noAccessDescription')}
        />
      );
    }
    return (
      <PurchasesTabs
        active={active}
        visible={visible}
        can={access.can}
        overview={overview}
        onChange={changeTab}
        onOpenReport={canReport ? openReport : undefined}
      />
    );
  };

  return (
    <PageFrame
      icon={IconShoppingCart}
      title={t('hub.title')}
      description={t('hub.subtitle')}
      actions={
        <>
          <Tooltip label={t('hub.refresh')}>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              aria-label={t('hub.refresh')}
              onClick={refresh}
              loading={fetching}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          {canReport && (
            <Button
              variant="default"
              radius="md"
              leftSection={<IconChartBar size={16} />}
              onClick={openReport}
            >
              {t('hub.payablesReport')}
            </Button>
          )}
          {access.can(PURCHASE_MENU.documents, 'create') && (
            <Button
              radius="md"
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate(routes.purchases.requestAdd)}
            >
              {t('hub.createRequest')}
            </Button>
          )}
        </>
      }
    >
      {visible.length > 0 && (
        <OverviewMetrics
          data={overview}
          onOpenReport={canReport ? openReport : undefined}
          onOpenTab={changeTab}
        />
      )}
      <Paper withBorder radius="lg" p="md" bg="white">
        {body()}
      </Paper>
    </PageFrame>
  );
}
