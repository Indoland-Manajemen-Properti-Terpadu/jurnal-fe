import React from 'react';
import { Badge } from '@mantine/core';
import { IconCheck, IconClock, IconX } from '@tabler/icons-react';
import { VoucherStatus } from '@/module/petty-cash/domain/pettyCashTypes';
import { useTranslation } from '@/i18n';

export const VoucherStatusBadge: React.FC<{ status: VoucherStatus }> = ({ status }) => {
  const { t } = useTranslation('journal');

  switch (status) {
    case 'DRAFT':
      return (
        <Badge color="gray" variant="light" size="xs">
          {t('pettyCashStatusDraft')}
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge color="blue" variant="light" size="xs" leftSection={<IconCheck size={10} />}>
          {t('pettyCashStatusApproved')}
        </Badge>
      );
    case 'PAID':
    case 'PENDING_REIMBURSE':
      return (
        <Badge color="blue" variant="light" size="xs" leftSection={<IconCheck size={10} />}>
          {t('pettyCashStatusPaid')}
        </Badge>
      );
    case 'REIMBURSEMENT_PENDING':
      return (
        <Badge color="orange" variant="light" size="xs" leftSection={<IconClock size={10} />}>
          {t('pettyCashStatusReplenishing')}
        </Badge>
      );
    case 'REIMBURSED':
      return (
        <Badge color="teal" variant="light" size="xs" leftSection={<IconCheck size={10} />}>
          {t('pettyCashStatusReimbursed')}
        </Badge>
      );
    case 'VOID':
      return (
        <Badge color="red" variant="light" size="xs" leftSection={<IconX size={10} />}>
          {t('pettyCashStatusVoid')}
        </Badge>
      );
    case 'SUBMITTED':
      return (
        <Badge color="blue" variant="light" size="xs">
          {t('pettyCashStatusSubmitted')}
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge color="red" variant="light" size="xs">
          {t('pettyCashStatusRejected')}
        </Badge>
      );
    default:
      return <Badge size="xs">{status}</Badge>;
  }
};
