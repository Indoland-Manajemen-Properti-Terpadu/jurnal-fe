import type { ReactNode } from 'react';
import {
  ActionIcon,
  Box,
  CopyButton,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import type { Sale } from '@/module/sales/domain/sale';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { SaleStatusBadge } from '../shared/SaleStatusBadge';
import { DetailField } from './DetailField';
import { PaymentProgress } from './PaymentProgress';
import { SaleTimeline } from './SaleTimeline';
import classes from './SaleDetail.module.css';

type SaleOverviewCardProps = {
  sale: Sale;
  display: SaleDisplay;
  /** The action bar; it knows which actions this invoice offers. */
  actions: ReactNode;
};

export function SaleOverviewCard({ sale, display, actions }: Readonly<SaleOverviewCardProps>) {
  const { t, money, date } = display;
  // A draft or a voided invoice is not a receivable, so it has no outstanding balance to show.
  const isReceivable = sale.displayStatus.code !== 'DRAFT' && sale.displayStatus.code !== 'VOID';

  return (
    <Paper
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'xl' }}
      bg="white"
      className={classes.overview}
    >
      <Group justify="space-between" align="flex-start" gap="lg" wrap="wrap">
        <Box className={classes.identity}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.6}>
            {t('invoiceNumber')}
          </Text>
          <Group gap="xs" mt={4} wrap="wrap">
            <Title order={1} className={classes.invoiceNumber}>
              {sale.transactionNumber}
            </Title>
            <CopyButton value={sale.transactionNumber}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t('copied') : t('copyNumber')}>
                  <ActionIcon
                    onClick={copy}
                    aria-label={copied ? t('copied') : t('copyNumber')}
                    variant="subtle"
                    color="primary"
                    size="lg"
                  >
                    {copied ? <IconCheck size={17} /> : <IconCopy size={17} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
            <SaleStatusBadge status={sale.displayStatus} />
          </Group>
          <Text size="sm" c="dimmed" mt="sm">
            {sale.customer?.displayName || t('unknownCustomer')}
          </Text>
        </Box>
        <Box className={classes.actions}>{actions}</Box>
      </Group>
      <Divider my="lg" />
      <SaleTimeline code={sale.displayStatus.code} />
      <Divider my="lg" />
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" className={classes.facts}>
        <DetailField label={t('transactionDate')}>{date(sale.transactionDate)}</DetailField>
        <DetailField label={t('dueDate')}>{date(sale.dueDate)}</DetailField>
        <DetailField label={t('invoiceTotal')}>{money(sale.finalAmount)}</DetailField>
        {isReceivable && (
          <Box className={classes.balanceFact}>
            <Text size="xs" fw={700}>
              {t('remaining')}
            </Text>
            <Text size="lg" fw={800} className={classes.amount}>
              {money(sale.remainingAmount)}
            </Text>
          </Box>
        )}
      </SimpleGrid>
      {isReceivable && (
        <Box mt="lg">
          <PaymentProgress sale={sale} display={display} />
        </Box>
      )}
    </Paper>
  );
}
