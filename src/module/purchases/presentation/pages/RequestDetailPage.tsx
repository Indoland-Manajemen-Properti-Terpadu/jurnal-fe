import { Grid, Stack } from '@mantine/core';
import {
  IconBuilding,
  IconBuildingWarehouse,
  IconCalendar,
  IconFileText,
  IconUser,
} from '@tabler/icons-react';
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
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { useRequest } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.requests;

export default function RequestDetailPage() {
  const { id } = useParams();
  const { t, currentLanguage } = useTranslation('purchases');
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
    <DocumentFrame
      icon={IconFileText}
      number={doc.number}
      badges={<StatusBadge status={doc.status} label={doc.statusLabel} />}
      date={formatDay(doc.date, currentLanguage)}
      backTo={BACK}
      backLabel={t('requests.detail.backToList')}
      actions={<RequestActionBar request={doc} />}
      waiting={
        doc.status === 'SUBMITTED' &&
        !(requestActions(doc).verify && requestRights(can, doc.isOwner).decide)
          ? t('requests.detail.waitingAccounting')
          : undefined
      }
      facts={[
        {
          icon: IconCalendar,
          label: t('requests.detail.neededOn'),
          value: formatDay(doc.requiredDate, currentLanguage),
        },
        {
          icon: IconBuilding,
          label: t('common.department'),
          value: doc.department?.name ?? '-',
        },
        ...(doc.deliveryWarehouse
          ? [
              {
                icon: IconBuildingWarehouse,
                label: t('requests.detail.deliveryWarehouse'),
                value: doc.deliveryWarehouse.name,
                sub: doc.deliveryWarehouse.code,
              },
            ]
          : []),
        {
          icon: IconUser,
          label: t('requests.detail.requestedBy'),
          value: doc.requester?.name ?? '-',
          sub: doc.requester?.title,
        },
      ]}
    >
      <RequestStatusNotice request={doc} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
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
          </Stack>
        </Grid.Col>
      </Grid>
    </DocumentFrame>
  );
}
