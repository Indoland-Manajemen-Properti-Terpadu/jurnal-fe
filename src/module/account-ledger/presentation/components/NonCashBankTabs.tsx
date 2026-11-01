import { Badge, Tabs } from '@mantine/core';
import { IconInfoCircle, IconReceipt2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DetailAccountModel } from '@/module/chart-of-accounts';
import type { JournalEntryByAccount } from '@/module/journal-entries';
import type { NormalSide } from '../../domain/normalBalance';
import { AccountInfoPanel } from './AccountInfoPanel';
import { LedgerTabsShell } from './LedgerTabsShell';
import { LedgerTransactionsPanel } from './LedgerTransactionsPanel';

type PanelProps = React.ComponentProps<typeof LedgerTransactionsPanel>;

interface NonCashBankTabsProps {
  idAccount: string;
  account: DetailAccountModel;
  normalBalance: NormalSide;
  activeTab: string;
  onChange: (tab: string) => void;
  entries: PanelProps['entries'];
  selectedRecords: JournalEntryByAccount[];
  setSelectedRecords: PanelProps['setSelectedRecords'];
  totalCount: number;
}

/** Tab host of a regular ledger account: its movements and the account information. */
export const NonCashBankTabs: React.FC<NonCashBankTabsProps> = ({
  idAccount,
  account,
  normalBalance,
  activeTab,
  onChange,
  entries,
  selectedRecords,
  setSelectedRecords,
  totalCount,
}) => {
  const { t } = useTranslation('accountLedger');

  const tabs = (
    <>
      <Tabs.Tab
        value="transactions"
        leftSection={<IconReceipt2 size={16} />}
        rightSection={
          totalCount > 0 ? (
            <Badge size="xs" variant="light" color="primary">
              {totalCount}
            </Badge>
          ) : null
        }
      >
        {t('nonCashBank.tabs.transactions')}
      </Tabs.Tab>

      <Tabs.Tab value="info" leftSection={<IconInfoCircle size={16} />}>
        {t('nonCashBank.tabs.info')}
      </Tabs.Tab>
    </>
  );

  const panels = (
    <>
      <Tabs.Panel value="transactions" pt="xs">
        <LedgerTransactionsPanel
          variant="nonCashBank"
          idAccount={idAccount}
          entries={entries}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
        />
      </Tabs.Panel>

      <Tabs.Panel value="info" pt="xs">
        <AccountInfoPanel account={account} normalBalance={normalBalance} />
      </Tabs.Panel>
    </>
  );

  return (
    <LedgerTabsShell
      activeTab={activeTab}
      defaultTab="transactions"
      onChange={onChange}
      tabs={tabs}
      panels={panels}
    />
  );
};
