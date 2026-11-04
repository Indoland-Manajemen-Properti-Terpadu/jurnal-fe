import { useState } from 'react';
import { Button, Select, Stack } from '@mantine/core';
import { DialogFrame } from '@/module/petty-cash/presentation/components/DialogFrame';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { AdvanceRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import { useSetSettlementAccounts } from '@/module/petty-cash/presentation/hooks/useAdvanceMutations';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  advance: AdvanceRecord;
  opened: boolean;
  onClose: () => void;
}

/** Verifiers choose the expense account of every settlement line; finance verification needs them all. */
export function SettlementAccountsDialog({ advance, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const lookups = usePettyCashLookups();
  const save = useSetSettlementAccounts(advance.id);
  const [chosen, setChosen] = useState<Record<number, string | null>>({});

  const accountOf = (lineNo: number, current: string | null) =>
    lineNo in chosen ? chosen[lineNo] : current;
  const lines = advance.settlement.lines.map((line) => ({
    line,
    accountId: accountOf(line.lineNo, line.expenseAccount?.id ?? null),
  }));
  const complete = lines.every((item) => item.accountId);

  return (
    <DialogFrame
      opened={opened}
      onClose={onClose}
      title={t('advanceActions.saveAccounts')}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={save.isPending}>
            {t('actions.keep')}
          </Button>
          <Button
            loading={save.isPending}
            disabled={!complete}
            onClick={() =>
              save.mutate(
                lines.map(({ line, accountId }) => ({
                  lineNo: line.lineNo,
                  expenseAccountId: accountId as string,
                })),
                { onSuccess: onClose }
              )
            }
          >
            {t('advanceActions.saveAccounts')}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        {lines.map(({ line, accountId }) => (
          <Select
            key={line.lineNo}
            label={`${line.description} · ${formatCurrency(line.amount, false)}`}
            placeholder={t('advanceActions.accountPlaceholder')}
            data={(lookups.data?.expenseAccounts ?? []).map((account) => ({
              value: account.id,
              label: `${account.accountNumber} · ${account.name}`,
            }))}
            value={accountId}
            onChange={(value) => setChosen((current) => ({ ...current, [line.lineNo]: value }))}
            searchable
          />
        ))}
      </Stack>
    </DialogFrame>
  );
}
