import { Anchor, Group, Paper, Stack, Text } from '@mantine/core';
import { IconReceiptRefund } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { DetailCardHeader } from '@/components/DetailCardHeader/DetailCardHeader';
import { routes } from '@/router/routes';
import type { Sale } from '@/module/sales/domain/sale';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { useReturns } from '../../hooks/useReturnQueries';
import { ReturnStatusBadge } from '../returns/ReturnStatusBadge';
import classes from './SaleDetail.module.css';

const LIMIT = 20;

/** The returns issued against this invoice. Shows nothing while there are none. */
export function SaleReturnsCard({ sale, display }: Readonly<{ sale: Sale; display: SaleDisplay }>) {
  const { t, money, date } = display;
  const query = useReturns({ sale: sale.id, limit: LIMIT });
  const rows = query.data?.items ?? [];
  if (rows.length === 0) return null;

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <DetailCardHeader
        icon={<IconReceiptRefund size={19} />}
        title={t('returnsTitle')}
        subtitle={t('returnsSubtitle', { count: rows.length })}
      />
      <Stack gap="sm">
        {rows.map((row) => (
          <Group key={row.id} justify="space-between" wrap="nowrap" align="center">
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Anchor
                component={Link}
                to={routes.sales.returnDetail.replace(':id', row.id)}
                size="sm"
                fw={700}
              >
                {row.transactionNumber}
              </Anchor>
              <Text size="xs" c="dimmed">
                {date(row.transactionDate)}
              </Text>
            </Stack>
            <Group gap="sm" wrap="nowrap">
              <ReturnStatusBadge status={row.displayStatus} />
              <Text size="sm" fw={700} className={classes.amount}>
                {money(row.finalAmount)}
              </Text>
            </Group>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
