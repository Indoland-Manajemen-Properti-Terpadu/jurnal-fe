import { useState } from 'react';
import { Badge, Stack, Tabs } from '@mantine/core';
import {
  IconArrowsExchange,
  IconArrowsShuffle,
  IconFileSpreadsheet,
  IconReceipt2,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { BankStatementTable, type BankStatementRow } from '@/module/bank-statements';
import { CashMapping } from '@/module/chart-of-accounts';
import type { JournalEntryByAccount } from '@/module/journal-entries';
import { ReconciliationTable } from '@/module/reconciliation';
import { LedgerTabsShell } from './LedgerTabsShell';
import { LedgerTransactionsPanel } from './LedgerTransactionsPanel';

type PanelProps = React.ComponentProps<typeof LedgerTransactionsPanel>;

interface CashBankTabsProps {
  idAccount: string;
  activeTab: string;
  onChange: (tab: string) => void;
  entries: PanelProps['entries'];
  selectedRecords: JournalEntryByAccount[];
  setSelectedRecords: PanelProps['setSelectedRecords'];
  statementCount: number;
  unreconciledCount: number;
}

/**
 * Tab host of the cash/bank ledger. It composes the entries, bank statement, reconciliation and
 * cash mapping screens through the index of their modules. The `?tab=` query parameter that
 * links from the bank/cash pages carry is not read: the screen always opens on the first tab.
 */
export const CashBankTabs: React.FC<CashBankTabsProps> = ({
  idAccount,
  activeTab,
  onChange,
  entries,
  selectedRecords,
  setSelectedRecords,
  statementCount,
  unreconciledCount,
}) => {
  const { t } = useTranslation('accountLedger');
  const [selectedStatements, setSelectedStatements] = useState<BankStatementRow[]>([]);
  const journalCount = entries.data?.length || 0;

  const tabs = (
    <>
      <Tabs.Tab
        value="transaction"
        leftSection={<IconReceipt2 size={16} />}
        rightSection={
          journalCount > 0 ? (
            <Badge size="xs" variant="light" color="primary">
              {journalCount}
            </Badge>
          ) : null
        }
      >
        {t('cashBank.tabs.transaction')}
      </Tabs.Tab>

      <Tabs.Tab
        value="bankStatement"
        leftSection={<IconFileSpreadsheet size={16} />}
        rightSection={
          statementCount > 0 ? (
            <Badge size="xs" variant="light" color="blue">
              {statementCount}
            </Badge>
          ) : null
        }
      >
        {t('cashBank.tabs.bankStatement')}
      </Tabs.Tab>

      <Tabs.Tab
        value="reconciliation"
        leftSection={<IconArrowsExchange size={16} />}
        rightSection={
          unreconciledCount > 0 ? (
            <Badge color="orange" size="xs" circle>
              {unreconciledCount}
            </Badge>
          ) : (
            <Badge color="teal" size="xs" variant="light">
              {t('cashBank.tabs.matched')}
            </Badge>
          )
        }
      >
        {t('cashBank.tabs.reconciliation')}
      </Tabs.Tab>

      <Tabs.Tab value="cashMapping" leftSection={<IconArrowsShuffle size={16} />}>
        {t('cashBank.tabs.cashMapping')}
      </Tabs.Tab>
    </>
  );

  const panels = (
    <>
      <Tabs.Panel value="transaction" pt="xs">
        <LedgerTransactionsPanel
          variant="cashBank"
          idAccount={idAccount}
          entries={entries}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
        />
      </Tabs.Panel>

      <Tabs.Panel value="bankStatement" pt="xs">
        <Stack gap="md">
          <BankStatementTable
            selectedRecords={selectedStatements}
            setSelectedRecords={setSelectedStatements}
          />
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="reconciliation" pt="xs">
        <ReconciliationTable />
      </Tabs.Panel>

      <Tabs.Panel value="cashMapping" pt="xs">
        <Stack gap="md" mt="md">
          <CashMapping />
        </Stack>
      </Tabs.Panel>
    </>
  );

  return (
    <LedgerTabsShell
      activeTab={activeTab}
      defaultTab="transaction"
      onChange={onChange}
      tabs={tabs}
      panels={panels}
    />
  );
};
