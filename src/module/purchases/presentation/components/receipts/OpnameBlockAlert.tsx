import { Alert, Anchor } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { toApiError } from '@/lib/http/apiError';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

/**
 * A receipt, or the cancelling of one, is refused while its warehouse is being counted. The server
 * names the count, so the person can open it and see what is left to do.
 */
export const OpnameBlockAlert = ({ error }: Readonly<{ error: unknown }>) => {
  const { t } = useTranslation('purchases');
  const opname = error ? toApiError(error).blockingOpname : undefined;
  if (!opname) return null;
  return (
    <Alert
      color="orange"
      radius="md"
      icon={<IconLock size={18} />}
      title={t('receipts.opnameBlock.title')}
    >
      {t('receipts.opnameBlock.body')}{' '}
      <Anchor
        component={Link}
        to={routes.inventory.stockTakeDetail.replace(':id', opname.id)}
        fw={600}
        size="sm"
      >
        {t('receipts.opnameBlock.open', { number: opname.number })}
      </Anchor>
    </Alert>
  );
};
