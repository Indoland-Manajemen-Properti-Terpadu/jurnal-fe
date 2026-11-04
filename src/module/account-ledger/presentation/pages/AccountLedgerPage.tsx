import { useMemo, useState } from 'react';
import { Alert, Box, Button, Center, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { AppShellLayout } from '@/components/AppShellLayout';
import { accountDetailData, useDetailAccount } from '@/module/chart-of-accounts';
import { useJournalEntriesByAccount, type JournalEntryByAccount } from '@/module/journal-entries';
import { latestTransactionDate } from '../../domain/ledgerPresentation';
import { summarizeMutations, unwrapAccountDetail } from '../../domain/ledgerSummary';
import type { LedgerVariant } from '../../domain/ledgerVariant';
import { getNormalBalance } from '../../domain/normalBalance';
import { CashBankSummary } from '../components/CashBankSummary';
import { CashBankTabs } from '../components/CashBankTabs';
import { LedgerAccountDialogs } from '../components/LedgerAccountDialogs';
import { LedgerHeader } from '../components/LedgerHeader';
import { NonCashBankSummary } from '../components/NonCashBankSummary';
import { NonCashBankPanel } from '../components/NonCashBankPanel';
import { useCashBankSummary } from '../hooks/useCashBankSummary';
import { useLedgerAccountActions } from '../hooks/useLedgerAccountActions';

interface AccountLedgerPageProps {
  /** `cashBank` adds the bank statement, reconciliation and cash mapping; `nonCashBank` the account info. */
  variant: LedgerVariant;
}

const AccountLedgerContent: React.FC<AccountLedgerPageProps> = ({ variant }) => {
  const { t } = useTranslation('accountLedger');
  const { idAccount = '' } = useParams<{ idAccount: string }>();
  const isCashBank = variant === 'cashBank';

  const {
    accountDetail,
    isLoading: isLoadingAccount,
    isError: isAccountError,
    refetch: refetchAccount,
  } = useDetailAccount(idAccount);
  const entries = useJournalEntriesByAccount(idAccount);
  const summary = useCashBankSummary(idAccount, isCashBank);

  const account = accountDetailData(unwrapAccountDetail(accountDetail));
  const actions = useLedgerAccountActions({
    idAccount,
    variant,
    isArchived: account.isArchived,
  });

  const [selectedRecords, setSelectedRecords] = useState<JournalEntryByAccount[]>([]);
  const [activeTab, setActiveTab] = useState('transaction');

  const normalBalance = useMemo(
    () =>
      getNormalBalance({
        categoryName: account.category?.name,
        type: account.type,
        isDebit: account.category?.isDebit,
        isContra: account.isContra,
      }),
    [account.category?.name, account.category?.isDebit, account.type, account.isContra]
  );
  const metrics = useMemo(() => summarizeMutations(entries.data), [entries.data]);
  const lastEntryDate = useMemo(() => latestTransactionDate(entries.data), [entries.data]);

  // The cash/bank tab shows its own entries loader, the other ledger waits for the entries too.
  const isLoading = isCashBank ? isLoadingAccount : isLoadingAccount || entries.isLoading;

  if (isLoading) {
    return (
      <AppShellLayout>
        <Center h={400}>
          <Stack align="center" gap="sm">
            <Loader color="primary.6" size="lg" />
            <Text size="sm" c="dimmed">
              {t(`${variant}.loading`)}
            </Text>
          </Stack>
        </Center>
      </AppShellLayout>
    );
  }

  if (isAccountError) {
    return (
      <AppShellLayout>
        <Center h={400}>
          <Stack align="center" gap="sm" maw={420}>
            <IconAlertCircle size={40} color="var(--mantine-color-red-6)" />
            <Title order={4}>{t('common.loadFailedTitle')}</Title>
            <Text size="sm" c="dimmed" ta="center">
              {t('common.loadFailedMessage')}
            </Text>
            <Button variant="light" onClick={() => refetchAccount()}>
              {t('common.retry')}
            </Button>
          </Stack>
        </Center>
      </AppShellLayout>
    );
  }

  const journalCount = entries.data?.length || 0;

  return (
    <>
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <LedgerHeader
              variant={variant}
              idAccount={idAccount}
              account={account}
              normalBalance={normalBalance}
              isArchiving={actions.isArchiving}
              onArchive={actions.openArchiveModal}
              onDelete={actions.openDeleteModal}
            />

            {isCashBank ? (
              <>
                {summary.unreconciledCount > 0 && (
                  <Alert
                    icon={<IconAlertCircle size={18} />}
                    color="orange"
                    variant="light"
                    radius="md"
                    title={t('cashBank.alert.title')}
                  >
                    {t('cashBank.alert.before')}
                    <strong>
                      {t('cashBank.alert.count', { count: summary.unreconciledCount })}
                    </strong>
                    {t('cashBank.alert.middle')}
                    <strong>{t('cashBank.tabs.reconciliation')}</strong>
                    {t('cashBank.alert.after')}
                  </Alert>
                )}
                <CashBankSummary
                  ledgerAmount={account.amount ?? 0}
                  statementCount={summary.statementCount}
                  statementNet={summary.statementNet}
                  unreconciledStatements={summary.unreconciledCount}
                  unreconciledJournals={summary.unreconciledJournals}
                  journalCount={journalCount}
                  lastEntryDate={lastEntryDate}
                />
                <CashBankTabs
                  idAccount={idAccount}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  entries={entries}
                  selectedRecords={selectedRecords}
                  setSelectedRecords={setSelectedRecords}
                  statementCount={summary.statementCount}
                  unreconciledCount={summary.unreconciledCount}
                />
              </>
            ) : (
              <>
                <NonCashBankSummary
                  amount={account.amount ?? 0}
                  normalBalance={normalBalance}
                  metrics={metrics}
                  lastEntryDate={lastEntryDate}
                />
                <NonCashBankPanel
                  idAccount={idAccount}
                  entries={entries}
                  selectedRecords={selectedRecords}
                  setSelectedRecords={setSelectedRecords}
                />
              </>
            )}
          </Stack>
        </Box>
      </AppShellLayout>

      <LedgerAccountDialogs
        variant={variant}
        account={account}
        isDeleteOpen={actions.isDeleteModalOpen}
        isArchiveOpen={actions.isArchiveModalOpen}
        isDeleting={actions.isDeleting}
        isArchiving={actions.isArchiving}
        onCloseDelete={actions.closeDeleteModal}
        onCloseArchive={actions.closeArchiveModal}
        onDelete={actions.handleDelete}
        onArchive={actions.handleArchive}
      />
    </>
  );
};

/**
 * Ledger of one account (routes `accountLedger.cashBank` and `accountLedger.nonCashBank`). Keyed by variant: both
 * routes render this component, and the tab ids differ, so a switch between them must remount.
 */
const AccountLedgerPage: React.FC<AccountLedgerPageProps> = ({ variant }) => (
  <AccountLedgerContent key={variant} variant={variant} />
);

export default AccountLedgerPage;
