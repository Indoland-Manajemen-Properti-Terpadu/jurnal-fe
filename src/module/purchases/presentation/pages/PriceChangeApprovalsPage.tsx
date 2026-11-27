import { useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PriceChangeList } from '@/module/purchases/presentation/components/lists/PriceChangeList';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useApprovePriceChange,
  useRejectPriceChange,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { usePriceChanges } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { routes } from '@/router/routes';
import { IconTag } from '@tabler/icons-react';
import { Pagination, Stack } from '@mantine/core';

const PAGE_SIZE = 100;

export default function PriceChangeApprovalsPage() {
  const { t } = useTranslation('purchases');
  const access = usePurchaseAccess();
  const [page, setPage] = useState(1);
  const approve = useApprovePriceChange();
  const reject = useRejectPriceChange();
  const canReadQueue =
    access.can(PURCHASE_MENU.documents, 'read') ||
    access.can(PURCHASE_MENU.approvePriceChange, 'read');
  const query = usePriceChanges(
    { status: 'PENDING_APPROVAL', page, limit: PAGE_SIZE },
    !access.isLoading && canReadQueue
  );

  if (access.isLoading) return <StateFrame kind="loading" />;
  if (!canReadQueue) return <StateFrame kind="noAccess" backTo={routes.purchases.main} />;

  const body = () => {
    if (query.isLoading) return <StateFrame kind="loading" />;
    if (query.isError) {
      return (
        <StateFrame kind="error" backTo={routes.purchases.main} onRetry={() => query.refetch()} />
      );
    }
    const requests = query.data?.items ?? [];
    if (requests.length === 0) {
      return (
        <EmptyState
          icon={<IconTag size={32} stroke={1.6} />}
          title={t('bills.priceChange.queueEmpty')}
          description={t('bills.priceChange.queueSubtitle')}
        />
      );
    }
    return (
      <Stack gap="md">
        <PriceChangeList
          requests={requests}
          canDecide={access.can(PURCHASE_MENU.approvePriceChange, 'update')}
          busy={approve.isPending || reject.isPending}
          onApprove={(request, note) => {
            if (request.approvalStage === null) return;
            approve.mutate({ id: request.id, approvalStage: request.approvalStage, note });
          }}
          onReject={(request, reason) => {
            if (request.approvalStage === null) return;
            reject.mutate({
              id: request.id,
              approvalStage: request.approvalStage,
              reason,
            });
          }}
        />
        {(query.data?.totalPages ?? 0) > 1 && (
          <Pagination
            total={query.data?.totalPages ?? 1}
            value={page}
            onChange={setPage}
            withEdges
            size="sm"
          />
        )}
      </Stack>
    );
  };

  return (
    <PageFrame
      icon={IconTag}
      title={t('bills.priceChange.queueTitle')}
      description={t('bills.priceChange.queueSubtitle')}
      backTo={routes.purchases.main}
      backLabel={t('hub.title')}
    >
      {body()}
    </PageFrame>
  );
}
