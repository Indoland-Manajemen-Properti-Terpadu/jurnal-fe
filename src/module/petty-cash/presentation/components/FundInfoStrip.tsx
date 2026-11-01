import { Box, Paper, SimpleGrid, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';

function Item({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <Box>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={650} mt={4} component="div">
        {children}
      </Text>
    </Box>
  );
}

/** Who holds the cash, which ledger account backs it and the rules the backend enforces. */
export function FundInfoStrip({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const { settings } = fund;

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <SimpleGrid cols={{ base: 2, md: 3, lg: 5 }} spacing="lg">
        <Item label={t('workspace.custodian')}>
          {fund.custodian.name}
          <Text size="xs" c="dimmed" fw={400}>
            {fund.custodian.email}
          </Text>
        </Item>
        <Item label={t('workspace.account')}>
          {fund.account.accountNumber} · {fund.account.name}
          <Text component="div" mt={4}>
            <PettyCashStatusBadge kind="fund" status={fund.status} />
          </Text>
        </Item>
        <Item label={t('workspace.lastCount')}>
          {fund.lastCountAt ? dateFormatV1(fund.lastCountAt) : t('workspace.neverCounted')}
        </Item>
        <Item label={t('workspace.voucherApproval')}>
          {formatCurrency(settings.voucherApprovalThreshold, false)}
        </Item>
        <Item label={t('workspace.attachmentRequired')}>
          {formatCurrency(settings.attachmentRequiredThreshold, false)}
        </Item>
      </SimpleGrid>
    </Paper>
  );
}
