import { useState } from 'react';
import { Paper, Stack, Tabs } from '@mantine/core';
import { IconBook2, IconCash, IconReceipt2, IconScale, IconWallet } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { AdvanceDetailDrawer } from '@/module/petty-cash/presentation/components/AdvanceDetailDrawer';
import { AdvanceStatusBanner } from '@/module/petty-cash/presentation/components/AdvanceStatusBanner';
import { AdvanceList } from '@/module/petty-cash/presentation/components/AdvanceList';
import { CashBookPanel } from '@/module/petty-cash/presentation/components/CashBookPanel';
import { CountDetailDrawer } from '@/module/petty-cash/presentation/components/CountDetailDrawer';
import { CountList } from '@/module/petty-cash/presentation/components/CountList';
import { FundInfoStrip } from '@/module/petty-cash/presentation/components/FundInfoStrip';
import { ImprestBalancePanel } from '@/module/petty-cash/presentation/components/ImprestBalancePanel';
import { RecordCountButton } from '@/module/petty-cash/presentation/components/RecordCountButton';
import { ReplenishmentDetailDrawer } from '@/module/petty-cash/presentation/components/ReplenishmentDetailDrawer';
import { ReplenishmentList } from '@/module/petty-cash/presentation/components/ReplenishmentList';
import { RequestAdvanceButton } from '@/module/petty-cash/presentation/components/RequestAdvanceButton';
import { RequestReplenishmentButton } from '@/module/petty-cash/presentation/components/RequestReplenishmentButton';
import { VoucherDetailDrawer } from '@/module/petty-cash/presentation/components/VoucherDetailDrawer';
import { VoucherList } from '@/module/petty-cash/presentation/components/VoucherList';
import classes from '@/module/petty-cash/presentation/pages/PettyCashPage.module.css';

interface Selection {
  id: string;
  open: boolean;
}

const closeSelection = (current: Selection | null): Selection | null =>
  current ? { ...current, open: false } : null;

const TABS = ['vouchers', 'counts', 'replenishments', 'advances', 'cashBook'];

/**
 * Everything about one fund: position, rules, vouchers, cash counts, replenishments and the cash
 * book. Each drawer keeps its last id while it slides closed, so its body does not blank out.
 */
export function PettyCashWorkspace({
  fund,
  initialTab,
}: Readonly<{ fund: PettyCashFund; initialTab?: string | null }>) {
  const { t } = useTranslation('pettyCash');
  const [tab, setTab] = useState<string | null>(
    initialTab && TABS.includes(initialTab) ? initialTab : 'vouchers'
  );
  const [voucher, setVoucher] = useState<Selection | null>(null);
  const [count, setCount] = useState<Selection | null>(null);
  const [replenishment, setReplenishment] = useState<Selection | null>(null);
  const [advance, setAdvance] = useState<Selection | null>(null);

  return (
    <Stack gap="lg">
      <ImprestBalancePanel fund={fund} />
      <AdvanceStatusBanner />
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
            <Tabs.Tab value="counts" leftSection={<IconScale size={16} />}>
              {t('workspace.tabs.counts')}
            </Tabs.Tab>
            <Tabs.Tab value="replenishments" leftSection={<IconCash size={16} />}>
              {t('workspace.tabs.replenishments')}
            </Tabs.Tab>
            <Tabs.Tab value="advances" leftSection={<IconWallet size={16} />}>
              {t('workspace.tabs.advances')}
            </Tabs.Tab>
            <Tabs.Tab value="cashBook" leftSection={<IconBook2 size={16} />}>
              {t('workspace.tabs.cashBook')}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="vouchers">
            <VoucherList
              fundId={fund.id}
              onSelectVoucher={(id) => setVoucher({ id, open: true })}
            />
          </Tabs.Panel>
          <Tabs.Panel value="counts">
            <CountList
              fundId={fund.id}
              action={<RecordCountButton fund={fund} />}
              onSelect={(id) => setCount({ id, open: true })}
            />
          </Tabs.Panel>
          <Tabs.Panel value="replenishments">
            <ReplenishmentList
              fundId={fund.id}
              action={<RequestReplenishmentButton fund={fund} />}
              onSelect={(id) => setReplenishment({ id, open: true })}
            />
          </Tabs.Panel>
          <Tabs.Panel value="advances">
            <AdvanceList
              fundId={fund.id}
              action={<RequestAdvanceButton fund={fund} />}
              onSelect={(id) => setAdvance({ id, open: true })}
            />
          </Tabs.Panel>
          <Tabs.Panel value="cashBook">
            <CashBookPanel fundId={fund.id} />
          </Tabs.Panel>
        </Tabs>
      </Paper>
      <VoucherDetailDrawer
        fund={fund}
        voucherId={voucher?.id ?? null}
        opened={Boolean(voucher?.open)}
        onClose={() => setVoucher(closeSelection)}
      />
      <CountDetailDrawer
        countId={count?.id ?? null}
        opened={Boolean(count?.open)}
        onClose={() => setCount(closeSelection)}
      />
      <ReplenishmentDetailDrawer
        replenishmentId={replenishment?.id ?? null}
        opened={Boolean(replenishment?.open)}
        onClose={() => setReplenishment(closeSelection)}
      />
      <AdvanceDetailDrawer
        fund={fund}
        advanceId={advance?.id ?? null}
        opened={Boolean(advance?.open)}
        onClose={() => setAdvance(closeSelection)}
      />
    </Stack>
  );
}
