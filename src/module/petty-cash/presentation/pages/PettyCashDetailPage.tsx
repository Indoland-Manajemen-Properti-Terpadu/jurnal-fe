import { useState } from 'react';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconCoins, IconPlus } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { dateFormatV1 } from '@/utils/FormatDate';
import AppShellLayout from '@/components/AppShellLayout';
import { CreateVoucherModal } from '@/module/petty-cash/presentation/components/CreateVoucherModal';
import { PettyCashBalancePanel } from '@/module/petty-cash/presentation/components/PettyCashBalancePanel';
import { VoucherDetailDrawer } from '@/module/petty-cash/presentation/components/VoucherDetailDrawer';
import { VoucherTable } from '@/module/petty-cash/presentation/components/VoucherTable';
import { findFundById } from '@/module/petty-cash/domain/pettyCash';
import { usePettyCashPrototype } from '@/module/petty-cash/presentation/hooks/usePettyCashPrototype';
import type { PettyCashVoucher } from '@/module/petty-cash/domain/pettyCash.types';
import classes from '@/module/petty-cash/presentation/pages/PettyCashPage.module.css';

export default function PettyCashDetailPage() {
  const { fundId } = useParams<{ fundId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('journal');
  const prototype = usePettyCashPrototype();
  const fund = findFundById(prototype.funds, fundId);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PettyCashVoucher | null>(null);

  if (!fund) {
    return (
      <AppShellLayout withFooter>
        <Box className={classes.page} p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder radius="lg" p={{ base: 'xl', sm: 48 }} ta="center" maw={680} mx="auto">
            <Text fz={22} fw={700}>
              {t('pettyCashFundNotFound')}
            </Text>
            <Text c="dimmed" mt="xs">
              {t('pettyCashFundNotFoundDescription')}
            </Text>
            <Button mt="xl" variant="light" onClick={() => navigate(routes.BankAndCash.PettyCash)}>
              {t('pettyCashBack')}
            </Button>
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  const fundVouchers = prototype.vouchers.filter((voucher) => voucher.fundId === fund.id);

  return (
    <AppShellLayout withFooter>
      <Box className={classes.page} p={{ base: 'md', sm: 'xl' }}>
        <Stack className={classes.workspace} gap="lg">
          <ModuleHeader
            icon={IconCoins}
            title={fund.name}
            description={`${fund.code} · ${t('pettyCashFixedFund')}`}
            actions={
              <Group gap="sm">
                <Button
                  variant="default"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => navigate(routes.BankAndCash.PettyCash)}
                >
                  {t('pettyCashBack')}
                </Button>
                <Button
                  color="primary"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setVoucherModalOpen(true)}
                >
                  {t('pettyCashRecordExpense')}
                </Button>
              </Group>
            }
          />

          <PettyCashBalancePanel
            fund={fund}
            labels={{
              available: t('pettyCashAvailable'),
              ceiling: t('pettyCashCeiling'),
              unreimbursed: t('pettyCashUnreimbursed'),
              accountability: t('pettyCashAccountability'),
              used: t('pettyCashUsed'),
              lowBalance: t('pettyCashLowBalance'),
              availableStatus: t('pettyCashAvailableStatus'),
            }}
          />

          <Paper withBorder radius="lg" p="lg">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Box>
                <Text size="xs" c="dimmed">
                  {t('pettyCashCustodian')}
                </Text>
                <Text fw={650} mt={4}>
                  {fund.custodianName}
                </Text>
                <Text size="xs" c="dimmed">
                  {fund.custodianRole}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">
                  {t('pettyCashSourceBank')}
                </Text>
                <Text fw={650} mt={4}>
                  {fund.bankSourceAccount.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {fund.bankSourceAccount.accountNumber}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">
                  {t('pettyCashLastCount')}
                </Text>
                <Text fw={650} mt={4}>
                  {dateFormatV1(fund.lastOpnameDate)}
                </Text>
              </Box>
            </SimpleGrid>
          </Paper>

          <Paper withBorder radius="lg" p="md">
            <Text fw={700} mb="md">
              {t('pettyCashRecentExpenses')}
            </Text>
            <VoucherTable vouchers={fundVouchers} onViewVoucherDetail={setSelectedVoucher} />
          </Paper>
        </Stack>
      </Box>

      <CreateVoucherModal
        opened={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        funds={prototype.funds}
        selectedFund={fund}
        onSubmit={prototype.createPaidVoucher}
      />
      <VoucherDetailDrawer
        opened={Boolean(selectedVoucher)}
        onClose={() => setSelectedVoucher(null)}
        voucher={selectedVoucher}
      />
    </AppShellLayout>
  );
}
