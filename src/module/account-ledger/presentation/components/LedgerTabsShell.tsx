import type { ReactNode } from 'react';
import { Paper, Tabs } from '@mantine/core';

interface LedgerTabsShellProps {
  activeTab: string;
  defaultTab: string;
  onChange: (tab: string) => void;
  tabs: ReactNode;
  panels: ReactNode;
}

/** Card, pill tab list and panels container shared by both ledger variants. */
export const LedgerTabsShell: React.FC<LedgerTabsShellProps> = ({
  activeTab,
  defaultTab,
  onChange,
  tabs,
  panels,
}) => (
  <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
    <Tabs
      value={activeTab}
      onChange={(value) => onChange(value || defaultTab)}
      color="primary"
      variant="pills"
      radius="md"
    >
      <Tabs.List mb="md" style={{ borderBottom: '1px solid #E9ECEF', paddingBottom: 12 }}>
        {tabs}
      </Tabs.List>
      {panels}
    </Tabs>
  </Paper>
);
