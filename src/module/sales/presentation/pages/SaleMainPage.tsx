import { useEffect, useReducer, useState } from 'react';
import { ActionIcon, Box, Button, Group, Paper, Stack, Tabs, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconFileText, IconPlus, IconReceipt2, IconRefresh, IconSend } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { CreateSalePaymentPayload, Sale, SaleDisplayCode } from '../../domain/sale';
import { billingEmail } from '../../domain/saleActions';
import { formatCount, invoiceFilename } from '../../domain/saleFormat';
import {
  dateFilter,
  hasActiveFilters,
  initialListState,
  listParams,
  saleListReducer,
} from '../../domain/saleListState';
import type { SaleTab } from '../../domain/saleStatus';
import { PaySaleModal } from '../components/PaySaleModal';
import { SaleFilters } from '../components/list/SaleFilters';
import type { SaleRowHandlers } from '../components/list/SaleRowActions';
import { ReceivablesPanel } from '../components/list/ReceivablesPanel';
import { SaleTable } from '../components/SaleTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { TAB_DIVIDER } from '../components/shared/tabDivider';
import {
  useCopyInvoiceLink,
  useCreateSalePayment,
  useDeleteSale,
  useDownloadInvoicePdf,
  useSendSale,
} from '../hooks/useSaleMutations';
import { useSaleReceivables, useSaleStatusCounts, useSales } from '../hooks/useSaleQueries';

const detailPath = (id: string) => routes.sales.detail.replace(':id', id);
const editPath = (id: string) => routes.sales.edit.replace(':id', id);

export function SaleMainPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('sales');

  const [state, dispatch] = useReducer(saleListReducer, initialListState);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  useEffect(() => {
    dispatch({ type: 'search', value: debouncedSearch });
  }, [debouncedSearch]);

  const [payTarget, setPayTarget] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [sendTarget, setSendTarget] = useState<Sale | null>(null);

  const dates = dateFilter(state.range);
  const salesQuery = useSales(listParams(state));
  const summaryQuery = useSaleReceivables(dates);
  const countsQuery = useSaleStatusCounts({ search: state.search.trim() || undefined, ...dates });

  const payMutation = useCreateSalePayment();
  const sendMutation = useSendSale();
  const deleteMutation = useDeleteSale();
  const copyLink = useCopyInvoiceLink();
  const downloadPdf = useDownloadInvoicePdf();

  const sales = salesQuery.data?.items ?? [];
  const pagination = salesQuery.data?.pagination;
  const counts = countsQuery.data;
  const isFiltered = hasActiveFilters(state);

  const resetFilters = () => {
    setSearchInput('');
    dispatch({ type: 'reset' });
  };

  const showStatus = (value: SaleDisplayCode) => {
    dispatch({ type: 'tab', tab: 'sent' });
    dispatch({ type: 'status', value });
  };

  // Without an address the invoice is still issued, but nothing is emailed.
  const sendHasEmail = sendTarget ? Boolean(billingEmail(sendTarget)) : true;

  const handlers: SaleRowHandlers = {
    onView: (sale) => navigate(detailPath(sale.id)),
    onEdit: (sale) => navigate(editPath(sale.id)),
    onDelete: setDeleteTarget,
    onSend: setSendTarget,
    onResend: (sale) => sendMutation.mutate({ id: sale.id, sendEmail: true, resend: true }),
    onPay: setPayTarget,
    onCopyLink: (sale) => copyLink.mutate(sale.id),
    onDownloadPdf: (sale) =>
      downloadPdf.mutate({ id: sale.id, filename: invoiceFilename(sale.transactionNumber) }),
  };

  const handlePaySubmit = (payload: CreateSalePaymentPayload) => payMutation.mutateAsync(payload);

  const tabLabel = (key: 'draft' | 'sent', count?: number) =>
    count === undefined ? t(`tabs.${key}`) : t(`tabs.${key}Count`, { count: formatCount(count) });

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconReceipt2}
            title={t('page.title')}
            description={t('page.description')}
            actions={
              <Group gap="xs">
                <Tooltip label={t('page.refreshTooltip')} withArrow>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => {
                      salesQuery.refetch();
                      summaryQuery.refetch();
                      countsQuery.refetch();
                    }}
                    loading={salesQuery.isFetching}
                    aria-label={t('page.refreshAria')}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
                <Button
                  color="primary"
                  leftSection={<IconPlus size={18} />}
                  onClick={() => navigate(routes.sales.add)}
                >
                  {t('page.create')}
                </Button>
              </Group>
            }
          />

          <ReceivablesPanel
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
            range={state.range}
            onShowStatus={showStatus}
          />

          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={state.tab}
              onChange={(value) => dispatch({ type: 'tab', tab: (value as SaleTab) || 'draft' })}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md" style={TAB_DIVIDER}>
                <Tabs.Tab value="draft" leftSection={<IconFileText size={16} />}>
                  {tabLabel('draft', counts?.DRAFT)}
                </Tabs.Tab>
                <Tabs.Tab value="sent" leftSection={<IconSend size={16} />}>
                  {tabLabel('sent', counts?.sent)}
                </Tabs.Tab>
              </Tabs.List>

              <Stack gap="md">
                <SaleFilters
                  tab={state.tab}
                  searchInput={searchInput}
                  onSearchInput={setSearchInput}
                  status={state.status}
                  onStatus={(value) => dispatch({ type: 'status', value })}
                  range={state.range}
                  onRange={(value) => dispatch({ type: 'range', value })}
                  isFiltered={isFiltered}
                  onReset={resetFilters}
                />
                <SaleTable
                  sales={sales}
                  tab={state.tab}
                  isLoading={salesQuery.isLoading}
                  isError={salesQuery.isError}
                  isFiltered={isFiltered}
                  page={state.page}
                  totalPages={pagination?.totalPages || 1}
                  total={pagination?.total || 0}
                  limit={state.limit}
                  handlers={handlers}
                  onPageChange={(value) => dispatch({ type: 'page', value })}
                  onLimitChange={(value) => dispatch({ type: 'limit', value })}
                  onRetry={() => salesQuery.refetch()}
                  onCreateNew={() => navigate(routes.sales.add)}
                />
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      <ConfirmModal
        opened={deleteTarget !== null}
        tone="danger"
        loading={deleteMutation.isPending}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage', { number: deleteTarget?.transactionNumber ?? '' })}
        confirmLabel={t('confirm.deleteConfirm')}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id).catch(() => undefined);
          setDeleteTarget(null);
        }}
      />

      <ConfirmModal
        opened={sendTarget !== null}
        loading={sendMutation.isPending}
        title={t('confirm.sendTitle', { number: sendTarget?.transactionNumber ?? '' })}
        message={t(sendHasEmail ? 'confirm.sendMessage' : 'confirm.sendMessageNoEmail')}
        confirmLabel={t(sendHasEmail ? 'confirm.sendConfirm' : 'confirm.sendConfirmNoEmail')}
        onClose={() => setSendTarget(null)}
        onConfirm={async () => {
          if (!sendTarget) return;
          await sendMutation
            .mutateAsync({ id: sendTarget.id, sendEmail: sendHasEmail })
            .catch(() => undefined);
          setSendTarget(null);
        }}
      />

      <PaySaleModal
        opened={payTarget !== null}
        sale={payTarget}
        isSubmitting={payMutation.isPending}
        onClose={() => setPayTarget(null)}
        onSubmit={handlePaySubmit}
      />
    </AppShellLayout>
  );
}

export default SaleMainPage;
