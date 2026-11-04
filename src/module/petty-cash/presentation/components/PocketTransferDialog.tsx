import { useState } from 'react';
import {
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { FundPocket } from '@/module/petty-cash/domain/pettyCashEntities';
import { activePockets } from '@/module/petty-cash/domain/pettyCashView';
import {
  emptyTransfer,
  toTransferInput,
  validateTransfer,
  type PocketTransferDraft,
} from '@/module/petty-cash/domain/pockets';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { usePocketTransfer } from '@/module/petty-cash/presentation/hooks/usePocketMutations';

const money = (amount: number) => formatCurrency(amount, false);

/** Moves cash between pockets of one fund. The custodian does it; the cash book records both legs. */
export function PocketTransferDialog({
  fundId,
  pockets,
  opened,
  onClose,
}: Readonly<{ fundId: string; pockets: FundPocket[]; opened: boolean; onClose: () => void }>) {
  const { t } = useTranslation('pettyCash');
  const today = todayWib();
  const transfer = usePocketTransfer(fundId);
  const [draft, setDraft] = useState<PocketTransferDraft>(() => emptyTransfer(today));
  const [touched, setTouched] = useState(false);

  const offered = activePockets(pockets);
  const options = offered.map((pocket) => ({ value: pocket.code, label: pocket.name }));
  const source = offered.find((pocket) => pocket.code === draft.fromPocket);
  const issues = validateTransfer(draft, pockets, today);
  const errorOf = (path: string) => {
    const issue = issues.find((item) => item.path === path);
    return touched && issue ? t(`pocketAdmin.issue.${issue.code}`) : undefined;
  };

  const close = () => {
    setTouched(false);
    onClose();
  };

  return (
    <DecisionDialog
      opened={opened}
      title={t('pocketAdmin.transferTitle')}
      body={t('pocketAdmin.transferBody')}
      confirmLabel={t('pocketAdmin.transferSubmit')}
      loading={transfer.isPending}
      onClose={close}
      onConfirm={() => {
        setTouched(true);
        if (issues.length > 0) return;
        transfer.mutate(toTransferInput(draft), {
          onSuccess: () => {
            setDraft(emptyTransfer(today));
            close();
          },
        });
      }}
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Select
            label={t('pocketAdmin.from')}
            data={options}
            value={draft.fromPocket}
            onChange={(fromPocket) => setDraft({ ...draft, fromPocket })}
            error={errorOf('fromPocket')}
            required
          />
          {source && (
            <Text size="xs" c="dimmed">
              {t('pocketAdmin.available', { amount: money(source.balance) })}
            </Text>
          )}
        </Stack>
        <ThemeIcon variant="light" color="gray" radius="xl" size={28} mt={28} aria-hidden>
          <IconArrowRight size={14} />
        </ThemeIcon>
        <Select
          style={{ flex: 1 }}
          label={t('pocketAdmin.to')}
          data={options.filter((option) => option.value !== draft.fromPocket)}
          value={draft.toPocket}
          onChange={(toPocket) => setDraft({ ...draft, toPocket })}
          error={errorOf('toPocket')}
          required
        />
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <NumberInput
          label={t('pocketAdmin.amount')}
          value={draft.amount}
          onChange={(value) => setDraft({ ...draft, amount: value === '' ? '' : Number(value) })}
          error={errorOf('amount')}
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          decimalScale={0}
          leftSection={<Text size="sm">Rp</Text>}
          required
        />
        <DatePickerInput
          label={t('pocketAdmin.date')}
          value={draft.date || null}
          onChange={(value) => setDraft({ ...draft, date: value ?? '' })}
          maxDate={today}
          valueFormat="DD/MM/YYYY"
          error={errorOf('date')}
          required
        />
      </SimpleGrid>
      <TextInput
        label={t('pocketAdmin.memo')}
        value={draft.memo}
        onChange={(event) => setDraft({ ...draft, memo: event.currentTarget.value })}
      />
    </DecisionDialog>
  );
}
