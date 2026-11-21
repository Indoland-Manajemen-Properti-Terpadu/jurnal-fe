import { Alert, Text } from '@mantine/core';
import { IconArrowBackUp, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';

/** The one page-level note: why a request was sent back, who verified it, or what comes next. */
export const RequestStatusNotice = ({ request }: Readonly<{ request: PurchaseRequest }>) => {
  const { t } = useTranslation('purchases');

  if (request.status === 'RETURNED') {
    return (
      <Alert
        color="yellow"
        variant="light"
        radius="md"
        icon={<IconArrowBackUp size={18} />}
        title={t('requests.notice.returnedTitle', { name: request.returnedBy?.name ?? '-' })}
      >
        <Text size="sm">{request.returnNote || '-'}</Text>
        <Text size="xs" c="dimmed" mt={4}>
          {t('requests.notice.returnedHint')}
        </Text>
      </Alert>
    );
  }
  if (request.status === 'SUBMITTED') {
    return (
      <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
        {t('requests.notice.submitted')}
      </Alert>
    );
  }
  if (request.status === 'VERIFIED') {
    return (
      <Alert
        color="green"
        variant="light"
        radius="md"
        icon={<IconCircleCheck size={18} />}
        title={t('requests.notice.verifiedTitle', { name: request.verifiedBy?.name ?? '-' })}
      >
        {t('requests.notice.verified')}
      </Alert>
    );
  }
  if (request.status === 'CANCELLED' && request.cancelReason) {
    return (
      <Alert color="gray" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
        {t('requests.notice.cancelled', { reason: request.cancelReason })}
      </Alert>
    );
  }
  return null;
};
