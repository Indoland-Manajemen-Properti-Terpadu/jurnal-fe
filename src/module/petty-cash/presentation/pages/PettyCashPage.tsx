import { useState } from 'react';
import { Badge, Box, Button, Group, Menu, Paper, Stack, Table, Tabs, Text } from '@mantine/core';
import {
  IconChevronDown,
  IconCoins,
  IconPlus,
  IconReceipt2,
  IconRefresh,
  IconScale,
} from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { AppShellLayout } from '@/components/AppShellLayout';
import { CashCountModal } from '@/module/petty-cash/presentation/components/CashCountModal';
import { CreateVoucherModal } from '@/module/petty-cash/presentation/components/CreateVoucherModal';
import { PettyCashBalancePanel } from '@/module/petty-cash/presentation/components/PettyCashBalancePanel';
import { PettyCashFundSelector } from '@/module/petty-cash/presentation/components/PettyCashFundSelector';
import { ReplenishmentModal } from '@/module/petty-cash/presentation/components/ReplenishmentModal';
import { VoucherDetailDrawer } from '@/module/petty-cash/presentation/components/VoucherDetailDrawer';
import { VoucherTable } from '@/module/petty-cash/presentation/components/VoucherTable';
import { usePettyCashPrototype } from '@/module/petty-cash/presentation/hooks/usePettyCashPrototype';
import type { PettyCashVoucher } from '@/module/petty-cash/domain/pettyCashTypes';
import classes from '@/module/petty-cash/presentation/pages/PettyCashPage.module.css';

export default function PettyCashPage() {
  const { t } = useTranslation('journal');
  const prototype = usePettyCashPrototype();
  const [selectedFundId, setSelectedFundId] = useState(prototype.funds[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<string | null>('expenses');
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [replenishmentModalOpen, setReplenishmentModalOpen] = useState(false);
  const [cashCountModalOpen, setCashCountModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PettyCashVoucher | null>(null);

  const selectedFund =
    prototype.funds.find((fund) => fund.id === selectedFundId) ?? prototype.funds[0];
  if (!selectedFund) return null;

  const visibleVouchers = prototype.vouchers.filter(
    (voucher) => voucher.fundId === selectedFund.id
  );
  const visibleReimbursements = prototype.reimbursements.filter(
    (item) => item.fundId === selectedFund.id
  );
  const visibleCounts = prototype.cashCounts.filter((item) => item.fundId === selectedFund.id);

  return (
    <AppShellLayout withFooter>
      <Box className={classes.page} p={{ base: 'md', sm: 'xl' }}>
        <Stack className={classes.workspace} gap="lg">
          <ModuleHeader
            icon={IconCoins}
            title={t('pettyCash')}
            description={t('pettyCashSubtitle')}
            actions={
              <Button
                color="primary"
                leftSection={<IconPlus size={16} />}
                onClick={() => setVoucherModalOpen(true)}
                disabled={selectedFund.status === 'FROZEN'}
              >
                {t('pettyCashRecordExpense')}
              </Button>
            }
          />

          <Paper className={classes.toolbar} radius="lg" p="md">
            <Group justify="space-between" align="flex-end" gap="md" wrap="wrap">
              <PettyCashFundSelector
                funds={prototype.funds}
                value={selectedFund.id}
                onChange={setSelectedFundId}
                label={t('pettyCashFund')}
              />
              <Menu position="bottom-end" width={250} shadow="md">
                <Menu.Target>
                  <Button variant="default" rightSection={<IconChevronDown size={14} />}>
                    {t('pettyCashMoreActions')}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => setReplenishmentModalOpen(true)}
                    disabled={selectedFund.status === 'FROZEN'}
                  >
                    {t('pettyCashRequestReplenishment')}
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconScale size={16} />}
                    onClick={() => setCashCountModalOpen(true)}
                    disabled={selectedFund.status === 'FROZEN'}
                  >
                    {t('pettyCashCountCash')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Paper>

          <PettyCashBalancePanel
            fund={selectedFund}
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

          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List className={classes.tabsList} mb="md">
                <Tabs.Tab value="expenses" leftSection={<IconReceipt2 size={16} />}>
                  {t('pettyCashExpenses')}
                </Tabs.Tab>
                <Tabs.Tab value="replenishments" leftSection={<IconRefresh size={16} />}>
                  {t('pettyCashReplenishments')}
                </Tabs.Tab>
                <Tabs.Tab value="counts" leftSection={<IconScale size={16} />}>
                  {t('pettyCashCounts')}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="expenses">
                <VoucherTable vouchers={visibleVouchers} onViewVoucherDetail={setSelectedVoucher} />
              </Tabs.Panel>

              <Tabs.Panel value="replenishments">
                <Table.ScrollContainer minWidth={760}>
                  <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('pettyCashDocument')}</Table.Th>
                        <Table.Th>{t('pettyCashDate')}</Table.Th>
                        <Table.Th>{t('pettyCashVoucherCount')}</Table.Th>
                        <Table.Th ta="right">{t('pettyCashAmount')}</Table.Th>
                        <Table.Th>{t('pettyCashStatus')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {visibleReimbursements.map((item) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>
                            <Text fw={650}>{item.reimbursementNumber}</Text>
                          </Table.Td>
                          <Table.Td>{dateFormatV1(item.date)}</Table.Td>
                          <Table.Td>{item.voucherCount}</Table.Td>
                          <Table.Td ta="right">
                            <Text fw={650}>{formatCurrency(item.totalAmount)}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                item.status === 'DISBURSED'
                                  ? 'teal'
                                  : item.status === 'REJECTED'
                                    ? 'red'
                                    : item.status === 'APPROVED'
                                      ? 'cyan'
                                      : 'blue'
                              }
                              variant="light"
                            >
                              {item.status === 'DISBURSED'
                                ? t('pettyCashDisbursed')
                                : item.status === 'APPROVED'
                                  ? t('pettyCashStatusApproved')
                                  : item.status === 'REJECTED'
                                    ? t('pettyCashStatusRejected')
                                    : t('pettyCashSubmitted')}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Tabs.Panel>

              <Tabs.Panel value="counts">
                <Table.ScrollContainer minWidth={700}>
                  <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('pettyCashDocument')}</Table.Th>
                        <Table.Th>{t('pettyCashDate')}</Table.Th>
                        <Table.Th ta="right">{t('pettyCashPhysical')}</Table.Th>
                        <Table.Th ta="right">{t('pettyCashVariance')}</Table.Th>
                        <Table.Th>{t('pettyCashStatus')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {visibleCounts.map((count) => (
                        <Table.Tr key={count.id}>
                          <Table.Td>
                            <Text fw={650}>{count.countNumber}</Text>
                          </Table.Td>
                          <Table.Td>{dateFormatV1(count.date)}</Table.Td>
                          <Table.Td ta="right">{formatCurrency(count.totalPhysicalCash)}</Table.Td>
                          <Table.Td ta="right">{formatCurrency(count.variance)}</Table.Td>
                          <Table.Td>
                            <Badge
                              color={count.status === 'BALANCED' ? 'teal' : 'orange'}
                              variant="light"
                            >
                              {count.status === 'BALANCED' ? t('balanced') : t('difference')}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      <CreateVoucherModal
        opened={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        funds={prototype.funds}
        selectedFund={selectedFund}
        onSubmit={prototype.createPaidVoucher}
      />
      <ReplenishmentModal
        opened={replenishmentModalOpen}
        onClose={() => setReplenishmentModalOpen(false)}
        funds={prototype.funds}
        selectedFund={selectedFund}
        vouchers={prototype.vouchers}
        onSubmitReimbursement={prototype.submitReimbursement}
      />
      <CashCountModal
        opened={cashCountModalOpen}
        onClose={() => setCashCountModalOpen(false)}
        funds={prototype.funds}
        selectedFund={selectedFund}
        vouchers={prototype.vouchers}
        onSubmitCount={prototype.recordCashCount}
      />
      <VoucherDetailDrawer
        opened={Boolean(selectedVoucher)}
        onClose={() => setSelectedVoucher(null)}
        voucher={selectedVoucher}
      />
    </AppShellLayout>
  );
}
