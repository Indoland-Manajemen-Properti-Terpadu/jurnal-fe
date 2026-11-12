import { useSearchParams } from 'react-router-dom';
import { Grid, Paper, Stack, Tabs } from '@mantine/core';
import { IconCashBanknote, IconReceipt2 } from '@tabler/icons-react';
import type { Sale } from '@/module/sales/domain/sale';
import { TAB_DIVIDER } from '../shared/tabDivider';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { SaleItemsCard } from './SaleItemsCard';
import { SaleNotesCard } from './SaleNotesCard';
import { SalePaymentHistoryCard } from './SalePaymentHistoryCard';
import { SaleSidebar } from './SaleSidebar';

type SaleDetailTabsProps = {
  sale: Sale;
  display: SaleDisplay;
  /** Payments received so far; undefined while they load. */
  paymentCount?: number;
};

type DetailTab = 'details' | 'payments';

/** `?tab=payments` opens the history; `&payment=<id>` also marks one payment in it. */
const TAB_PARAM = 'tab';
const PAYMENT_PARAM = 'payment';

/**
 * Everything below the overview, in one card. The first tab is the invoice (lines, notes and the
 * side cards for customer, link and extras); the second is only the payments received. A draft or
 * void invoice has no payments, so it shows the invoice without tabs.
 */
export function SaleDetailTabs({ sale, display, paymentCount }: Readonly<SaleDetailTabsProps>) {
  const { t } = display;
  const [params, setParams] = useSearchParams();
  const hasPayments = sale.displayStatus.code !== 'DRAFT' && sale.displayStatus.code !== 'VOID';
  const tab: DetailTab =
    hasPayments && params.get(TAB_PARAM) === 'payments' ? 'payments' : 'details';
  const highlightId = params.get(PAYMENT_PARAM) ?? undefined;

  const changeTab = (value: string | null) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === 'payments') next.set(TAB_PARAM, 'payments');
        else next.delete(TAB_PARAM);
        next.delete(PAYMENT_PARAM);
        return next;
      },
      { replace: true }
    );
  };

  const details = (
    <Grid gutter="lg" align="flex-start">
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Stack gap="lg">
          <SaleItemsCard sale={sale} display={display} />
          {(sale.message || sale.memo) && <SaleNotesCard sale={sale} display={display} />}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 4 }}>
        <SaleSidebar sale={sale} display={display} />
      </Grid.Col>
    </Grid>
  );

  const tabbed = (
    <Tabs value={tab} onChange={changeTab} color="primary" variant="pills" radius="md">
      <Tabs.List mb="md" style={TAB_DIVIDER}>
        <Tabs.Tab value="details" leftSection={<IconReceipt2 size={16} />}>
          {t('tabDetails')}
        </Tabs.Tab>
        <Tabs.Tab value="payments" leftSection={<IconCashBanknote size={16} />}>
          {paymentCount === undefined
            ? t('tabPayments')
            : t('tabPaymentsCount', { count: paymentCount })}
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="details">{details}</Tabs.Panel>
      <Tabs.Panel value="payments">
        <SalePaymentHistoryCard sale={sale} display={display} highlightId={highlightId} />
      </Tabs.Panel>
    </Tabs>
  );

  return (
    <Paper withBorder radius="lg" p={{ base: 'sm', sm: 'md' }} bg="white">
      {hasPayments ? tabbed : details}
    </Paper>
  );
}

export default SaleDetailTabs;
