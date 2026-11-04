import { Paper } from '@mantine/core';
import type { JournalEntryByAccount } from '@/module/journal-entries';
import { LedgerTransactionsPanel } from './LedgerTransactionsPanel';

type PanelProps = React.ComponentProps<typeof LedgerTransactionsPanel>;

interface NonCashBankPanelProps {
  idAccount: string;
  entries: PanelProps['entries'];
  selectedRecords: JournalEntryByAccount[];
  setSelectedRecords: PanelProps['setSelectedRecords'];
}

/** A regular ledger account has one view, its movements, so there is no tab bar. */
export const NonCashBankPanel: React.FC<NonCashBankPanelProps> = ({
  idAccount,
  entries,
  selectedRecords,
  setSelectedRecords,
}) => (
  <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
    <LedgerTransactionsPanel
      variant="nonCashBank"
      idAccount={idAccount}
      entries={entries}
      selectedRecords={selectedRecords}
      setSelectedRecords={setSelectedRecords}
    />
  </Paper>
);
