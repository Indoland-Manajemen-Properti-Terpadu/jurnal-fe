import { useState } from 'react';
import { Alert, Button, NumberInput, Stack, Text, Textarea } from '@mantine/core';
import { IconAlertCircle, IconWallet } from '@tabler/icons-react';
import { DialogFrame } from '@/module/petty-cash/presentation/components/DialogFrame';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  validateAdvanceRequest,
  type AdvanceRequestDraft,
} from '@/module/petty-cash/domain/advance';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { useAdvanceStatus } from '@/module/petty-cash/presentation/hooks/useAdvanceQueries';
import { useCreateAdvance } from '@/module/petty-cash/presentation/hooks/useAdvanceMutations';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

const EMPTY: AdvanceRequestDraft = { amount: '', purpose: '' };

/** Asks for an advance on this fund; hidden without the right, and held while the user is blocked. */
export function RequestAdvanceButton({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const status = useAdvanceStatus(access.canRequestAdvance() ? 'me' : undefined);
  const create = useCreateAdvance(fund.id);
  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [touched, setTouched] = useState(false);

  if (!access.canRequestAdvance()) return null;

  const max = fund.settings.advanceMaxAmount;
  const issues = validateAdvanceRequest(draft, { maxAmount: max || null });
  const issueOf = (path: string) => {
    const issue = issues.find((item) => item.path === path);
    return touched && issue ? t(`advanceRequest.issue.${issue.code}`) : undefined;
  };
  const blocked = status.data?.isBlocked ?? false;

  const close = () => {
    setOpened(false);
    setDraft(EMPTY);
    setTouched(false);
  };
  const submit = () => {
    setTouched(true);
    if (issues.length > 0 || blocked) return;
    create.mutate(
      { amount: draft.amount as number, purpose: draft.purpose.trim() },
      { onSuccess: close }
    );
  };

  return (
    <>
      <Button
        variant="light"
        leftSection={<IconWallet size={16} />}
        onClick={() => setOpened(true)}
      >
        {t('advances.request')}
      </Button>
      <DialogFrame
        opened={opened}
        onClose={close}
        title={t('advanceRequest.title')}
        footer={
          <>
            <Button variant="default" onClick={close} disabled={create.isPending}>
              {t('actions.keep')}
            </Button>
            <Button loading={create.isPending} disabled={blocked} onClick={submit}>
              {t('advanceRequest.submit')}
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <Text size="sm">{t('advanceRequest.body')}</Text>
          {blocked && (
            <Alert color="orange" icon={<IconAlertCircle size={18} />} radius="md">
              {t('advanceRequest.blocked')}
            </Alert>
          )}
          <NumberInput
            label={t('advanceRequest.amount')}
            description={
              max ? t('advanceRequest.amountHint', { max: formatCurrency(max, false) }) : undefined
            }
            value={draft.amount}
            onChange={(value) =>
              setDraft((current) => ({ ...current, amount: value === '' ? '' : Number(value) }))
            }
            error={issueOf('amount')}
            thousandSeparator="."
            decimalSeparator=","
            allowNegative={false}
            decimalScale={0}
            leftSection={<Text size="sm">Rp</Text>}
            required
            data-autofocus
          />
          <Textarea
            label={t('advanceRequest.purpose')}
            placeholder={t('advanceRequest.purposePlaceholder')}
            value={draft.purpose}
            onChange={(event) => {
              const purpose = event.currentTarget.value;
              setDraft((current) => ({ ...current, purpose }));
            }}
            error={issueOf('purpose')}
            minRows={3}
            autosize
            required
          />
        </Stack>
      </DialogFrame>
    </>
  );
}
