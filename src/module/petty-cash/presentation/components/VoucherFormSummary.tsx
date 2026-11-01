import { Alert, Button, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconDeviceFloppy, IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import {
  approvalHint,
  attachmentRequired,
  cashCheck,
} from '@/module/petty-cash/domain/voucherForm';

interface Props {
  fund: PettyCashFund;
  net: number;
  /** A line uses a tax code, so the saved total will be higher than the net shown. */
  hasTax: boolean;
  hasAttachment: boolean;
  pending: boolean;
  showIssues: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

function Row({
  label,
  value,
  strong,
}: Readonly<{ label: string; value: string; strong?: boolean }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c={strong ? 'dark.9' : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : 600} ta="right">
        {value}
      </Text>
    </Group>
  );
}

/** Live effect of the voucher on the fund, and the two ways to save it. Server figures stay authoritative. */
export function VoucherFormSummary({
  fund,
  net,
  hasTax,
  hasAttachment,
  pending,
  showIssues,
  onCancel,
  onSaveDraft,
  onSubmit,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const cash = cashCheck(net, fund.balance.availableCash);
  const needsReceipt = attachmentRequired(net, fund.settings.attachmentRequiredThreshold);
  const receiptMissing = needsReceipt && !hasAttachment;
  const approval = approvalHint(net, fund.settings.voucherApprovalThreshold, hasTax);

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="sm">
        <Text fw={700}>{t('form.summaryTitle')}</Text>
        <Row label={t('form.fund')} value={`${fund.code} · ${fund.name}`} />
        <Row label={t('form.availableCash')} value={money(fund.balance.availableCash)} />
        <Divider />
        <Row label={t('form.net')} value={money(net)} strong />
        <Text size="xs" c="dimmed">
          {t('form.taxNote')}
        </Text>
        {net > 0 && !cash.exceeds && (
          <Row
            label={t(hasTax ? 'form.remainingBeforeTax' : 'form.remaining')}
            value={money(cash.remaining)}
          />
        )}

        {cash.exceeds && (
          <Alert
            color="red"
            variant="light"
            radius="md"
            icon={<IconAlertTriangle size={16} />}
            title={t('form.exceedsTitle')}
          >
            {t('form.exceedsBody')}
          </Alert>
        )}
        {receiptMissing && (
          <Alert color="orange" variant="light" radius="md" icon={<IconAlertTriangle size={16} />}>
            {t('form.attachmentNeeded', {
              threshold: money(fund.settings.attachmentRequiredThreshold),
            })}
          </Alert>
        )}
        {approval !== 'NONE' && (
          <Text size="xs" c="dimmed">
            {t(approval === 'REQUIRED' ? 'form.approvalNeeded' : 'form.approvalPossible', {
              threshold: money(fund.settings.voucherApprovalThreshold),
            })}
          </Text>
        )}
        {showIssues && (
          <Text size="sm" c="red.7" role="alert">
            {t('form.fixIssues')}
          </Text>
        )}

        <Stack gap="xs" mt="xs">
          <Button
            leftSection={<IconSend size={16} />}
            loading={pending}
            disabled={cash.exceeds || receiptMissing}
            onClick={onSubmit}
            fullWidth
          >
            {t('form.submit')}
          </Button>
          <Button
            variant="default"
            leftSection={<IconDeviceFloppy size={16} />}
            disabled={pending}
            onClick={onSaveDraft}
            fullWidth
          >
            {t('form.saveDraft')}
          </Button>
          <Button variant="subtle" color="gray" disabled={pending} onClick={onCancel} fullWidth>
            {t('form.cancel')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
