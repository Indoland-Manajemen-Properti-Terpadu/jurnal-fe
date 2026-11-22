import { Tabs } from '@mantine/core';
import { IconArrowsLeftRight, IconPackage, IconTransfer } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { StockTab } from '@/module/inventory/presentation/components/stock/stockFilters';

type Props = {
  value: StockTab;
  onChange: (tab: StockTab) => void;
};

/** The three views of Stock Movements as pill tabs, the same as the other master lists. */
export function StockTabList({ value, onChange }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  return (
    <Tabs
      value={value}
      onChange={(next) => onChange((next as StockTab | null) ?? 'balances')}
      color="primary"
      variant="pills"
      radius="md"
    >
      <Tabs.List>
        <Tabs.Tab value="balances" leftSection={<IconPackage size={16} />}>
          {t('tabs.balances')}
        </Tabs.Tab>
        <Tabs.Tab value="history" leftSection={<IconArrowsLeftRight size={16} />}>
          {t('tabs.history')}
        </Tabs.Tab>
        <Tabs.Tab value="transfers" leftSection={<IconTransfer size={16} />}>
          {t('tabs.transfers')}
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
