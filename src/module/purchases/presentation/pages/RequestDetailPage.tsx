import { Grid, Group, Stack, Text } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { requestActions } from '@/module/purchases/domain/purchaseActions';
import { QuotationsSection } from '@/module/purchases/presentation/components/requests/QuotationsSection';
import { RequestActionBar } from '@/module/purchases/presentation/components/requests/RequestActionBar';
import { RequestSummaryCard } from '@/module/purchases/presentation/components/requests/RequestSummaryCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { RequestHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useApproveRequest,
  useRejectRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { usePurchaseJourney } from '@/module/purchases/presentation/hooks/usePurchaseJourney';
import { useRequest } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = `${routes.purchases.main}?tab=requests`;

export default function RequestDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const request = useRequest(id);
  const journey = usePurchaseJourney({ requestId: id, current: 'request' });
  const approve = useApproveRequest();
  const reject = useRejectRequest();

  if (accessLoading || request.isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!canRead()) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (request.isError) {
    return request.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          request.refetch();
        }}
      />
    );
  }
  const doc = request.data;
  if (!doc) {
    return <StateFrame kind="loading" />;
  }

  const actions = requestActions(doc);
  const canUpdate = can(PURCHASE_MENU.documents, 'update');

  return (
    <PageFrame
      icon={IconShoppingCart}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} />
        </Group>
      }
      description={doc.purpose || t('requests.detail.subtitle')}
      backTo={BACK}
      backLabel={t('common.back')}
      actions={<RequestActionBar request={doc} />}
    >
      <RequestHighlights doc={doc} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <RequestSummaryCard request={doc} />
            {doc.mode === 'WITH_QUOTATION' && (
              <QuotationsSection
                request={doc}
                canEdit={canUpdate}
                fillQuotations={actions.fillQuotations}
                selectVendor={actions.selectVendor}
              />
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <ApprovalPanel
              approval={doc.approval}
              status={doc.status}
              canApprove={can(PURCHASE_MENU.approvePurchaseRequest, 'update')}
              busy={approve.isPending || reject.isPending}
              onApprove={(note) => approve.mutate({ id: doc.id, note })}
              onReject={(reason) => reject.mutate({ id: doc.id, reason })}
            />
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="request"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={canUpdate}
            />
            {doc.status === 'CONVERTED' && (
              <Text size="xs" c="dimmed">
                {t('requests.detail.convertedHint')}
              </Text>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
}
