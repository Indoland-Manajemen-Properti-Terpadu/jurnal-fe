import { Grid, Group, Stack } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { requestActions } from '@/module/purchases/domain/purchaseActions';
import { requestRights } from '@/module/purchases/domain/requestAccess';
import { ProcurementSection } from '@/module/purchases/presentation/components/procurement/ProcurementSection';
import { RequestActionBar } from '@/module/purchases/presentation/components/requests/RequestActionBar';
import { RequestStatusNotice } from '@/module/purchases/presentation/components/requests/RequestStatusNotice';
import { RequestSummaryCard } from '@/module/purchases/presentation/components/requests/RequestSummaryCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { RequestHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { useRequest } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.requests;

export default function RequestDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const request = useRequest(id);
  const journey = useDocumentChain('purchaseRequest', id);

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

  const canAttach = requestActions(doc).attach && requestRights(can, doc.isOwner).edit;

  return (
    <PageFrame
      icon={IconShoppingCart}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} label={doc.statusLabel} />
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
            <RequestStatusNotice request={doc} />
            <ProcurementSection request={doc} />
            <RequestSummaryCard request={doc} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="request"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={canAttach}
            />
            {doc.iom.attachments.length > 0 && (
              <AttachmentsCard
                target="request"
                requestFile="iom"
                titleKey="requests.detail.iomFiles"
                documentId={doc.id}
                attachments={doc.iom.attachments}
                canUpload={canAttach}
              />
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
}
