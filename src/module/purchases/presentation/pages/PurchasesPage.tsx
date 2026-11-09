import { ActionIcon, Button, Skeleton, Stack, Tooltip } from '@mantine/core';
import { IconLock, IconPlus, IconRefresh, IconShoppingCart } from '@tabler/icons-react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  LIST_TABS,
  listPath,
  visibleTabs,
} from '@/module/purchases/presentation/components/hub/hubTabs';
import { OverviewMetrics } from '@/module/purchases/presentation/components/hub/OverviewMetrics';
import { OverviewTab } from '@/module/purchases/presentation/components/hub/OverviewTab';
import { useOverviewData } from '@/module/purchases/presentation/components/hub/useOverviewData';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';
import { routes } from '@/router/routes';

/** Landing page of the purchasing area: what needs attention, where documents stand, payables aging. */
export default function PurchasesPage() {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const access = usePurchaseAccess();
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const fetching = useIsFetching({ queryKey: purchaseKeys.all(scope) }) > 0;

  const overview = useOverviewData(access.can);
  const canReport = access.can(PURCHASE_MENU.reports, 'read');
  const openReport = () => navigate(routes.purchases.payables);
  const visible = visibleTabs(access.can);

  // Old links opened a tab of this page (`?tab=bills`); each tab is a page of its own now.
  const legacyTab = LIST_TABS.find((tab) => tab === params.get('tab'));
  if (legacyTab) return <Navigate to={listPath(legacyTab)} replace />;

  const body = () => {
    if (access.isLoading) {
      return (
        <Stack gap="md">
          <Skeleton height={104} radius="md" />
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
      <>
        <OverviewMetrics
          data={overview}
          onOpenReport={canReport ? openReport : undefined}
          onOpenTab={() => navigate(routes.purchases.payments)}
        />
        <OverviewTab
          can={access.can}
          data={overview}
          onOpen={(tab) => navigate(listPath(tab))}
          onOpenReport={canReport ? openReport : undefined}
        />
      </>
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
              onClick={() => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) })}
              loading={fetching}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
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
      {body()}
    </PageFrame>
  );
}
