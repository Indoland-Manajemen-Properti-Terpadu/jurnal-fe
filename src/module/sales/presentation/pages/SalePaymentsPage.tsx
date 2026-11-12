import { useEffect, useReducer, useState } from 'react';
import { ActionIcon, Box, Paper, Stack, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCashBanknote, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  hasActivePaymentFilters,
  initialPaymentListState,
  paymentListParams,
  paymentListReducer,
} from '../../domain/salePaymentList';
import { SalePaymentFilters } from '../components/payments/SalePaymentFilters';
import { SalePaymentTable } from '../components/payments/SalePaymentTable';
import { useSalePayments } from '../hooks/useSaleQueries';

export function SalePaymentsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('sales');
  const [state, dispatch] = useReducer(paymentListReducer, initialPaymentListState);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  useEffect(() => {
    dispatch({ type: 'search', value: debouncedSearch });
  }, [debouncedSearch]);

  const query = useSalePayments(paymentListParams(state));
  const pagination = query.data?.pagination;
  const isFiltered = hasActivePaymentFilters(state);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconCashBanknote}
            title={t('payments.title')}
            description={t('payments.description')}
            actions={
              <Tooltip label={t('payments.refreshTooltip')} withArrow>
                <ActionIcon
                  variant="default"
                  size="lg"
                  radius="md"
                  onClick={() => query.refetch()}
                  loading={query.isFetching}
                  aria-label={t('payments.refreshAria')}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            }
          />

          <Paper withBorder radius="lg" p="md" bg="white">
            <Stack gap="md">
              <SalePaymentFilters
                searchInput={searchInput}
                onSearchInput={setSearchInput}
                range={state.range}
                onRange={(value) => dispatch({ type: 'range', value })}
                overpayment={state.overpayment}
                onOverpayment={(value) => dispatch({ type: 'overpayment', value })}
                customer={state.customer}
                onCustomer={(value) => dispatch({ type: 'customer', value })}
                paymentMethod={state.paymentMethod}
                onPaymentMethod={(value) => dispatch({ type: 'paymentMethod', value })}
                depositAccount={state.depositAccount}
                onDepositAccount={(value) => dispatch({ type: 'depositAccount', value })}
                isFiltered={isFiltered}
                onReset={() => {
                  setSearchInput('');
                  dispatch({ type: 'reset' });
                }}
              />
              <SalePaymentTable
                rows={query.data?.items ?? []}
                isLoading={query.isLoading}
                isError={query.isError}
                isFiltered={isFiltered}
                page={state.page}
                totalPages={pagination?.totalPages || 1}
                total={pagination?.total || 0}
                limit={state.limit}
                sortBy={state.sortBy}
                sortOrder={state.sortOrder}
                onSort={(by) => dispatch({ type: 'sort', by })}
                onOpenPayment={(saleId, paymentId) =>
                  navigate(
                    `${routes.sales.detail.replace(':id', saleId)}?tab=payments&payment=${paymentId}`
                  )
                }
                onPageChange={(value) => dispatch({ type: 'page', value })}
                onLimitChange={(value) => dispatch({ type: 'limit', value })}
                onRetry={() => query.refetch()}
              />
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default SalePaymentsPage;
