import { useState } from 'react';
import { Paper, Stack, Tabs } from '@mantine/core';
import { IconBook2, IconReceipt2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { CashBookPanel } from '@/module/petty-cash/presentation/components/CashBookPanel';
import { FundInfoStrip } from '@/module/petty-cash/presentation/components/FundInfoStrip';
import { ImprestBalancePanel } from '@/module/petty-cash/presentation/components/ImprestBalancePanel';
import { VoucherDetailDrawer } from '@/module/petty-cash/presentation/components/VoucherDetailDrawer';
import { VoucherList } from '@/module/petty-cash/presentation/components/VoucherList';
import classes from '@/module/petty-cash/presentation/pages/PettyCashPage.module.css';

/** Everything about one fund: position, rules, vouchers and cash book. Later phases add tabs. */
export function PettyCashWorkspace({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const [tab, setTab] = useState<string | null>('vouchers');
  const [selected, setSelected] = useState<{ id: string; open: boolean } | null>(null);

  return (
    <Stack gap="lg">
      <ImprestBalancePanel fund={fund} />
      <FundInfoStrip fund={fund} />
      <Paper withBorder radius="lg" p="md" bg="white">
        <Tabs
          value={tab}
          onChange={setTab}
          color="primary"
          variant="pills"
          radius="md"
          keepMounted={false}
        >
          <Tabs.List className={classes.tabsList} mb="md">
            <Tabs.Tab value="vouchers" leftSection={<IconReceipt2 size={16} />}>
              {t('workspace.tabs.vouchers')}
            </Tabs.Tab>
            <Tabs.Tab value="cashBook" leftSection={<IconBook2 size={16} />}>
              {t('workspace.tabs.cashBook')}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="vouchers">
            <VoucherList
              fundId={fund.id}
              onSelectVoucher={(id) => setSelected({ id, open: true })}
            />
          </Tabs.Panel>
          <Tabs.Panel value="cashBook">
            <CashBookPanel fundId={fund.id} />
          </Tabs.Panel>
        </Tabs>
      </Paper>
      <VoucherDetailDrawer
        fund={fund}
        voucherId={selected?.id ?? null}
        opened={Boolean(selected?.open)}
        onClose={() => setSelected((current) => (current ? { ...current, open: false } : null))}
      />
    </Stack>
  );
}
