import { useState } from 'react';
import {
  Alert, Badge, Box, Button, Divider, Group, Menu, Paper, ScrollArea, Skeleton, Stack,
  Table, Text, TextInput, ThemeIcon, Title,
} from '@mantine/core';
import {
  IconBook2, IconCalendar, IconChevronDown, IconDownload, IconInfoCircle,
  IconRefresh, IconSearch,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { validateReportPeriod } from '../../application/use-cases/getGeneralLedger';
import type { GeneralLedgerAccount, GeneralLedgerExportType, ReportPeriod } from '../../domain/entities/generalLedger';
import type { GeneralLedgerRepository } from '../../domain/repositories/generalLedgerRepository';
import { useGeneralLedgerReport } from '../hooks/useGeneralLedgerReport';
import { displayDate, formatCount, formatMoney } from '../utils/reportFormat';
import styles from './GeneralLedgerPage.module.css';

function AccountList({ accounts, selectedId, onSelect }: {
  accounts: GeneralLedgerAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Stack gap={4} role="group" aria-label="Pilih akun buku besar" className={styles.accountList}>
      {accounts.map((account) => (
        <button
          type="button"
          aria-pressed={account.id === selectedId}
          key={account.id}
          className={styles.accountButton}
          data-active={account.id === selectedId}
          onClick={() => onSelect(account.id)}
        >
          <span className={styles.accountCode}>{account.number}</span>
          <span className={styles.accountName}>{account.name}</span>
          <span className={styles.accountBalance}>{formatMoney(account.closingBalance)}</span>
        </button>
      ))}
    </Stack>
  );
}

function TransactionTable({ account }: { account: GeneralLedgerAccount }) {
  return (
    <ScrollArea className={styles.tableScroll}>
      <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tanggal</Table.Th>
            <Table.Th>Referensi</Table.Th>
            <Table.Th>Keterangan</Table.Th>
            <Table.Th ta="right">Debit</Table.Th>
            <Table.Th ta="right">Kredit</Table.Th>
            <Table.Th ta="right">Saldo</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {account.transactions.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <EmptyState
                  title="Belum ada mutasi"
                  description="Tidak ada transaksi pada akun ini untuk periode yang dipilih. Saldo awal dan akhir tetap ditampilkan di atas."
                  py={40}
                />
              </Table.Td>
            </Table.Tr>
          ) : account.transactions.map((transaction, index) => (
            <Table.Tr key={`${transaction.journalId}-${transaction.transactionNumber}-${index}`}>
              <Table.Td>{displayDate(transaction.transactionDate)}</Table.Td>
              <Table.Td><Text fw={600} size="sm" c="primary.7">{transaction.transactionNumber}</Text></Table.Td>
              <Table.Td><Text size="sm" className={styles.description}>{transaction.description}</Text></Table.Td>
              <Table.Td ta="right" className={styles.amount}>{formatMoney(transaction.debit)}</Table.Td>
              <Table.Td ta="right" className={styles.amount}>{formatMoney(transaction.credit)}</Table.Td>
              <Table.Td ta="right" className={styles.balance}>{formatMoney(transaction.balance)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        {account.transactions.length > 0 && (
          <Table.Tfoot>
            <Table.Tr>
              <Table.Th colSpan={3}>Total periode</Table.Th>
              <Table.Th ta="right">{formatMoney(account.periodDebit)}</Table.Th>
              <Table.Th ta="right">{formatMoney(account.periodCredit)}</Table.Th>
              <Table.Th ta="right">{formatMoney(account.closingBalance)}</Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        )}
      </Table>
    </ScrollArea>
  );
}

export default function GeneralLedgerPage({ repository }: { repository: GeneralLedgerRepository }) {
  const ledger = useGeneralLedgerReport(repository);
  const [draft, setDraft] = useState<ReportPeriod>(ledger.period);
  const [validationError, setValidationError] = useState<string | null>(null);

  function applyPeriod() {
    try {
      validateReportPeriod(draft);
      setValidationError(null);
      ledger.setSelectedAccountId(null);
      ledger.setPeriod(draft);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Rentang tanggal tidak valid.');
    }
  }

  const selected = ledger.selectedAccount;
  const report = ledger.query.data;
  const transactionCount = ledger.accounts.reduce(
    (count, account) => count + account.transactions.length,
    0
  );

  return (
    <AppShellLayout>
      <Box className={styles.page}>
        <ModuleHeader
          icon={IconBook2}
          title="Buku Besar"
          description="Ikuti pergerakan setiap akun dari saldo awal hingga saldo akhir, lengkap dengan transaksi debit dan kreditnya."
          breadcrumbs={[{ label: 'Laporan', to: routes.resultReport.main }, { label: 'Buku Besar' }]}
        />

        <Paper withBorder radius="lg" className={styles.filterPanel}>
          <Group justify="space-between" align="end" gap="md">
            <Box>
              <Text className={styles.eyebrow}>PERIODE LAPORAN</Text>
              <Text size="sm" c="dimmed" mt={4}>Pilih tanggal untuk memuat buku besar.</Text>
            </Box>
            <Group align="end" gap="sm" className={styles.filterControls}>
              <TextInput
                type="date"
                label="Dari tanggal"
                aria-label="Dari tanggal"
                leftSection={<IconCalendar size={16} />}
                value={draft.startDate}
                onChange={(event) => setDraft({ ...draft, startDate: event.currentTarget.value })}
              />
              <TextInput
                type="date"
                label="Sampai tanggal"
                aria-label="Sampai tanggal"
                leftSection={<IconCalendar size={16} />}
                value={draft.endDate}
                onChange={(event) => setDraft({ ...draft, endDate: event.currentTarget.value })}
              />
              <Button color="primary" onClick={applyPeriod} loading={ledger.query.isFetching}>Tampilkan</Button>
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <Button
                    variant="light"
                    color="primary"
                    leftSection={<IconDownload size={17} />}
                    rightSection={<IconChevronDown size={15} />}
                    loading={ledger.exportMutation.isPending}
                    disabled={!report || ledger.query.isFetching}
                  >
                    Ekspor
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {(['pdf', 'xlsx', 'csv'] as GeneralLedgerExportType[]).map((type) => (
                    <Menu.Item key={type} onClick={() => ledger.exportMutation.mutate(type)}>
                      {type.toUpperCase()}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
          {validationError && <Text c="red" size="sm" mt="sm" role="alert">{validationError}</Text>}
        </Paper>

        {ledger.query.isPending ? (
          <Stack gap="md" aria-label="Memuat buku besar">
            <Skeleton height={100} radius="lg" />
            <Skeleton height={440} radius="lg" />
          </Stack>
        ) : ledger.query.isError ? (
          <Alert color="red" title="Buku besar belum dapat dimuat" icon={<IconInfoCircle size={18} />}>
            <Group justify="space-between" gap="sm">
              <Text size="sm">{ledger.query.error.message}</Text>
              <Button size="xs" variant="light" color="red" leftSection={<IconRefresh size={15} />} onClick={() => ledger.query.refetch()}>
                Coba lagi
              </Button>
            </Group>
          </Alert>
        ) : report && (
          <>
            <Paper withBorder radius="lg" className={styles.summary}>
              <Group justify="space-between" gap="sm" mb="md">
                <Box>
                  <Text className={styles.eyebrow}>RINGKASAN PERIODE</Text>
                  <Text fw={700} c="primary.9" size="sm" mt={4}>
                    {displayDate(ledger.period.startDate)} – {displayDate(ledger.period.endDate)}
                  </Text>
                </Box>
                {report.periodLockType && (
                  <Badge color={report.periodLockType === 'LOCK' ? 'orange' : 'primary'} variant="light" size="lg">
                    {report.periodLockName ? `${report.periodLockName} · ` : ''}{report.periodLockType}
                  </Badge>
                )}
              </Group>
              <div className={styles.metricGrid}>
                <div className={styles.metric}><Text size="xs" c="dimmed">Akun tercatat</Text><Text className={styles.metricValue}>{formatCount(ledger.accounts.length)}</Text></div>
                <div className={styles.metric}><Text size="xs" c="dimmed">Transaksi</Text><Text className={styles.metricValue}>{formatCount(transactionCount)}</Text></div>
                <div className={styles.metric}><Text size="xs" c="dimmed">Total debit</Text><Text className={styles.metricValue}>{formatMoney(report.periodDebitTotal)}</Text></div>
                <div className={styles.metric}><Text size="xs" c="dimmed">Total kredit</Text><Text className={styles.metricValue}>{formatMoney(report.periodCreditTotal)}</Text></div>
              </div>
            </Paper>

            {ledger.accounts.length === 0 ? (
              <Paper withBorder radius="lg"><EmptyState title="Belum ada akun pada periode ini" description="Coba pilih rentang tanggal lain untuk melihat aktivitas buku besar." /></Paper>
            ) : (
              <div className={styles.workspace}>
                <Paper withBorder radius="lg" className={styles.sidebar}>
                  <Group justify="space-between" mb="sm">
                    <Text fw={700} c="primary.9">Daftar akun</Text>
                    <Badge variant="light" color="primary">{formatCount(ledger.accounts.length)}</Badge>
                  </Group>
                  <TextInput
                    aria-label="Cari akun"
                    placeholder="Cari kode atau nama akun"
                    leftSection={<IconSearch size={16} />}
                    value={ledger.accountSearch}
                    onChange={(event) => ledger.setAccountSearch(event.currentTarget.value)}
                    mb="md"
                  />
                  {ledger.filteredAccounts.length === 0 ? (
                    <EmptyState title="Akun tidak ditemukan" description="Coba kata kunci lain." py={24} />
                  ) : (
                    <ScrollArea className={styles.accountScroll}>
                      <AccountList
                        accounts={ledger.filteredAccounts}
                        selectedId={selected?.id ?? null}
                        onSelect={ledger.setSelectedAccountId}
                      />
                    </ScrollArea>
                  )}
                </Paper>

                {selected && (
                  <Paper withBorder radius="lg" className={styles.detail}>
                    <Group justify="space-between" align="flex-start" gap="sm">
                      <Group align="flex-start" wrap="nowrap" gap="sm">
                        <ThemeIcon color="primary" variant="light" radius="md" size={40}><IconBook2 size={22} /></ThemeIcon>
                        <Box>
                          <Text size="xs" fw={700} c="primary.6">AKUN {selected.number}</Text>
                          <Title order={3} c="primary.9" mt={2}>{selected.name}</Title>
                          <Text size="xs" c="dimmed" mt={4}>{selected.category}{selected.isContra ? ' · Akun kontra' : ''}</Text>
                        </Box>
                      </Group>
                      <Badge variant="outline" color="primary">{formatCount(selected.transactions.length)} transaksi</Badge>
                    </Group>
                    <Divider my="lg" />
                    <div className={styles.balanceGrid}>
                      <div><Text size="xs" c="dimmed">Saldo awal</Text><Text fw={700}>{formatMoney(selected.openingBalance)}</Text></div>
                      <div><Text size="xs" c="dimmed">Debit periode</Text><Text fw={700}>{formatMoney(selected.periodDebit)}</Text></div>
                      <div><Text size="xs" c="dimmed">Kredit periode</Text><Text fw={700}>{formatMoney(selected.periodCredit)}</Text></div>
                      <div className={styles.closingBalance}><Text size="xs" c="primary.6">Saldo akhir</Text><Text fw={800} c="primary.9">{formatMoney(selected.closingBalance)}</Text></div>
                    </div>
                    <Group justify="space-between" mt="xl" mb="xs">
                      <Text fw={700} c="primary.9">Rincian mutasi</Text>
                      <Text size="xs" c="dimmed">Urutan transaksi mengikuti data laporan</Text>
                    </Group>
                    <TransactionTable account={selected} />
                  </Paper>
                )}
              </div>
            )}
          </>
        )}
      </Box>
    </AppShellLayout>
  );
}
