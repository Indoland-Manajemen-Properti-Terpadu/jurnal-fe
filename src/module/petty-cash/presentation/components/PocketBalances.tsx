import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconArrowsExchange,
  IconBuildingBank,
  IconCash,
  IconPencil,
  IconPlus,
  IconWallet,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type {
  FundPocket,
  PettyCashFund,
  PocketType,
} from '@/module/petty-cash/domain/pettyCashEntities';
import { pocketsMatchCash } from '@/module/petty-cash/domain/pettyCashView';
import { PocketFormDialog } from '@/module/petty-cash/presentation/components/PocketFormDialog';
import { PocketTransferDialog } from '@/module/petty-cash/presentation/components/PocketTransferDialog';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

const money = (amount: number) => formatCurrency(amount, false);

const POCKET_ICON: Record<PocketType, typeof IconCash> = {
  CASH: IconCash,
  BANK: IconBuildingBank,
  EWALLET: IconWallet,
};

type Dialog = { kind: 'add' } | { kind: 'edit'; pocket: FundPocket } | { kind: 'transfer' } | null;

/**
 * Where the fund's cash sits: the cash box, petty cash bank accounts and e-wallets. A pocket only
 * itemizes the cash book (one ledger account), so the figures are shown as received and a warning
 * appears when they do not add up to the cash balance. Finance manages pockets; the custodian
 * moves cash between them.
 */
export function PocketBalances({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [openCount, setOpenCount] = useState(0);
  const { pockets } = fund;
  if (pockets.length === 0) return null;

  const open = (next: Dialog) => {
    setOpenCount((count) => count + 1);
    setDialog(next);
  };
  const active = fund.status === 'ACTIVE';
  const canManage = active && access.canManagePockets();
  const canTransfer =
    active &&
    access.canTransferBetweenPockets({
      custodianId: fund.custodian.id,
      singleUserOverride: fund.settings.singleUserOverride,
    }) &&
    pockets.filter((pocket) => pocket.isActive).length > 1;

  return (
    <Box>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Stack gap={2} style={{ flex: '1 1 280px' }}>
            <Text size="sm" fw={600} c="dark.8">
              {t('pockets.title')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('pockets.hint')}
            </Text>
          </Stack>
          <Group gap="xs">
            {canTransfer && (
              <Button
                size="xs"
                variant="light"
                leftSection={<IconArrowsExchange size={14} />}
                onClick={() => open({ kind: 'transfer' })}
              >
                {t('pocketAdmin.transfer')}
              </Button>
            )}
            {canManage && (
              <Button
                size="xs"
                variant="subtle"
                leftSection={<IconPlus size={14} />}
                onClick={() => open({ kind: 'add' })}
              >
                {t('pocketAdmin.add')}
              </Button>
            )}
          </Group>
        </Group>
        <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="sm">
          {pockets.map((pocket) => {
            const Icon = POCKET_ICON[pocket.type];
            return (
              <Paper
                key={pocket.code}
                withBorder
                radius="md"
                p="md"
                opacity={pocket.isActive ? 1 : 0.65}
              >
                <Group justify="space-between" wrap="nowrap" align="flex-start" gap="sm">
                  <Group gap="sm" wrap="nowrap" align="flex-start">
                    <Icon size={18} aria-hidden color="var(--mantine-color-gray-6)" />
                    <Stack gap={0}>
                      <Text size="sm" fw={600}>
                        {pocket.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {[t(`pockets.types.${pocket.type}`), pocket.provider, pocket.accountNumber]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </Stack>
                  </Group>
                  {!pocket.isActive && (
                    <Badge variant="light" color="gray" radius="sm" tt="none">
                      {t('pockets.inactive')}
                    </Badge>
                  )}
                </Group>
                <Group justify="space-between" align="center" mt="xs">
                  <Text fz="lg" fw={700} c="dark.9">
                    {money(pocket.balance)}
                  </Text>
                  {canManage && pocket.type !== 'CASH' && (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label={`${t('pocketAdmin.edit')} ${pocket.name}`}
                      onClick={() => open({ kind: 'edit', pocket })}
                    >
                      <IconPencil size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>
        {!pocketsMatchCash(pockets, fund.balance.cashBalance) && (
          <Text size="xs" c="orange.8" fw={600}>
            {t('pockets.mismatch')}
          </Text>
        )}
      </Stack>

      <PocketFormDialog
        key={`add-${openCount}`}
        fundId={fund.id}
        pockets={pockets}
        opened={dialog?.kind === 'add'}
        onClose={() => setDialog(null)}
      />
      {dialog?.kind === 'edit' && (
        <PocketFormDialog
          key={`edit-${dialog.pocket.code}-${openCount}`}
          fundId={fund.id}
          pockets={pockets}
          pocket={dialog.pocket}
          opened
          onClose={() => setDialog(null)}
        />
      )}
      <PocketTransferDialog
        key={`transfer-${openCount}`}
        fundId={fund.id}
        pockets={pockets}
        opened={dialog?.kind === 'transfer'}
        onClose={() => setDialog(null)}
      />
    </Box>
  );
}
