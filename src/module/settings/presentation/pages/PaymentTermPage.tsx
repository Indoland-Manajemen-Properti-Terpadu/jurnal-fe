import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Group, Paper, Stack } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import type { PaymentTerm } from '@/module/settings/domain/paymentTerm';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import { PaymentTermDeleteDialog } from '@/module/settings/presentation/components/paymentTerms/PaymentTermDeleteDialog';
import { PaymentTermFilters } from '@/module/settings/presentation/components/paymentTerms/PaymentTermFilters';
import { PaymentTermTable } from '@/module/settings/presentation/components/paymentTerms/PaymentTermTable';
import {
  usePaymentTermList,
  useSetPaymentTermStatus,
} from '@/module/settings/presentation/hooks/usePaymentTermQueries';
import { usePaymentTermListParams } from '@/module/settings/presentation/hooks/usePaymentTermListParams';

export default function PaymentTermPage() {
  const { t: st } = useTranslation('settings');
  const navigate = useNavigate();
  const filters = usePaymentTermListParams();
  const list = usePaymentTermList(filters.listParams);
  const setStatus = useSetPaymentTermStatus();
  const [deleting, setDeleting] = useState<PaymentTerm | null>(null);

  const goToNew = () => navigate(routes.settings.paymentTermNew);

  return (
    <SettingsLayout
      title={st('paymentTerm.title')}
      description={st('paymentTerm.description')}
      action={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            loading={list.isFetching && !list.isLoading}
            onClick={() => list.refetch()}
          >
            {st('common.refresh')}
          </Button>
          <Button color="primary" leftSection={<IconPlus size={16} />} onClick={goToNew}>
            {st('paymentTerm.addNew')}
          </Button>
        </Group>
      }
    >
      <Paper withBorder radius="lg" p="md" bg="white">
        <Stack gap="md">
          <PaymentTermFilters filters={filters} />
          <PaymentTermTable
            data={list.data}
            loading={list.isLoading}
            failed={list.isError}
            hasFilters={filters.hasFilters}
            statusPendingId={setStatus.isPending ? setStatus.variables?.id : undefined}
            onRetry={() => list.refetch()}
            onResetFilters={filters.reset}
            onAddNew={goToNew}
            onPageChange={filters.setPage}
            onEdit={(term) => navigate(routes.settings.paymentTermEdit.replace(':id', term.id))}
            onToggleStatus={(term) => setStatus.mutate({ id: term.id, isActive: !term.isActive })}
            onDelete={setDeleting}
          />
        </Stack>
      </Paper>

      <PaymentTermDeleteDialog term={deleting} onClose={() => setDeleting(null)} />
    </SettingsLayout>
  );
}
