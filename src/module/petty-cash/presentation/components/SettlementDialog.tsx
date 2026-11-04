import { useState } from 'react';
import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconPaperclip, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { DialogFrame } from '@/module/petty-cash/presentation/components/DialogFrame';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  emptySettlementDraft,
  emptySettlementLine,
  settlementBalance,
  settlementTotal,
  toSettlementInput,
  validateSettlementDraft,
  type SettlementDraft,
} from '@/module/petty-cash/domain/advance';
import type { AdvanceRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import { ATTACHMENT_TYPES, validateAttachmentFiles } from '@/module/petty-cash/domain/voucherForm';
import { useSubmitSettlement } from '@/module/petty-cash/presentation/hooks/useAdvanceMutations';

interface Props {
  advance: AdvanceRecord;
  opened: boolean;
  onClose: () => void;
  /** Runs after a successful submit, once the dialog has closed. */
  onSubmitted?: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

/** The requester accounts for the cash: what was spent (with receipts) and what goes back. */
export function SettlementDialog({ advance, opened, onClose, onSubmitted }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const today = todayWib();
  const submit = useSubmitSettlement(advance.id);
  const [draft, setDraft] = useState<SettlementDraft>(() => emptySettlementDraft(today));
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);

  const issues = validateSettlementDraft(draft, today);
  const fileIssues = validateAttachmentFiles(files, advance.attachments.length);
  const spent = settlementTotal(draft);
  const balance = settlementBalance(advance.amount, spent);
  const receiptsMissing = spent > 0 && files.length + advance.attachments.length === 0;
  const issueOf = (path: string) => {
    const issue = issues.find((item) => item.path === path);
    return touched && issue ? t(`settlementForm.issue.${issue.code}`) : undefined;
  };

  const patchLine = (key: string, patch: Partial<SettlementDraft['lines'][number]>) =>
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    }));

  const close = () => {
    setDraft(emptySettlementDraft(today));
    setFiles([]);
    setTouched(false);
    onClose();
  };

  const send = () => {
    setTouched(true);
    if (issues.length > 0 || fileIssues.length > 0 || receiptsMissing) return;
    submit.mutate(
      { input: toSettlementInput(draft), files },
      {
        onSuccess: () => {
          close();
          onSubmitted?.();
        },
      }
    );
  };

  const fileError = [
    ...fileIssues.map((issue) => t(`form.fileIssues.${issue.code}`, { name: issue.name })),
    ...(touched && receiptsMissing ? [t('settlementForm.receiptsRequired')] : []),
  ].join(' ');

  return (
    <DialogFrame
      opened={opened}
      onClose={close}
      title={t('settlementForm.title', { number: advance.advanceNumber })}
      size="lg"
      footer={
        <>
          <Button variant="default" onClick={close} disabled={submit.isPending}>
            {t('actions.keep')}
          </Button>
          <Button loading={submit.isPending} onClick={send}>
            {t('settlementForm.submit')}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Text size="sm">{t('settlementForm.body')}</Text>
        <Group grow align="flex-start">
          <DatePickerInput
            label={t('settlementForm.date')}
            value={draft.date || null}
            onChange={(value) => setDraft((current) => ({ ...current, date: value ?? '' }))}
            maxDate={today}
            valueFormat="DD/MM/YYYY"
            error={issueOf('date')}
            required
          />
          <TextInput
            label={t('settlementForm.beneficiary')}
            value={draft.beneficiary}
            onChange={(event) => {
              const beneficiary = event.currentTarget.value;
              setDraft((current) => ({ ...current, beneficiary }));
            }}
            error={issueOf('beneficiary')}
            required={draft.lines.length > 0}
          />
        </Group>
        <Group grow align="flex-start">
          <TextInput
            label={t('settlementForm.receiptNumber')}
            value={draft.receiptNumber}
            onChange={(event) => {
              const receiptNumber = event.currentTarget.value;
              setDraft((current) => ({ ...current, receiptNumber }));
            }}
          />
          <TextInput
            label={t('settlementForm.description')}
            value={draft.description}
            onChange={(event) => {
              const description = event.currentTarget.value;
              setDraft((current) => ({ ...current, description }));
            }}
          />
        </Group>

        <Stack gap="xs">
          <Text fw={650} size="sm">
            {t('settlementForm.lines')}
          </Text>
          {draft.lines.map((line, index) => (
            <Group key={line.key} align="flex-start" wrap="nowrap" gap="sm">
              <TextInput
                flex={1}
                aria-label={t('settlementForm.lineDescription')}
                placeholder={t('settlementForm.lineDescription')}
                value={line.description}
                onChange={(event) =>
                  patchLine(line.key, { description: event.currentTarget.value })
                }
                error={issueOf(`lines.${index}.description`)}
              />
              <NumberInput
                w={170}
                aria-label={t('settlementForm.lineAmount')}
                placeholder={t('settlementForm.lineAmount')}
                value={line.amount}
                onChange={(value) =>
                  patchLine(line.key, { amount: value === '' ? '' : Number(value) })
                }
                error={issueOf(`lines.${index}.amount`)}
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                decimalScale={0}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                mt={4}
                aria-label={t('settlementForm.removeLine', { index: index + 1 })}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    lines: current.lines.filter((item) => item.key !== line.key),
                  }))
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={14} />}
            w="fit-content"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                lines: [...current.lines, emptySettlementLine()],
              }))
            }
          >
            {t('settlementForm.addLine')}
          </Button>
        </Stack>

        <Stack gap={4}>
          <Group justify="space-between">
            <Text fw={650} size="sm">
              {t('settlementForm.receipts')}
            </Text>
            <FileButton
              multiple
              accept={ATTACHMENT_TYPES.join(',')}
              onChange={(picked) => setFiles((current) => [...current, ...picked])}
            >
              {(props) => (
                <Button
                  {...props}
                  variant="light"
                  size="xs"
                  leftSection={<IconPaperclip size={14} />}
                >
                  {t('form.attachmentsChoose')}
                </Button>
              )}
            </FileButton>
          </Group>
          {files.map((file, index) => (
            <Group key={`${file.name}-${file.lastModified}-${index}`} justify="space-between">
              <Text size="sm">{file.name}</Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label={t('form.attachmentRemove', { name: file.name })}
                onClick={() => setFiles((current) => current.filter((_, at) => at !== index))}
              >
                <IconX size={14} />
              </ActionIcon>
            </Group>
          ))}
          {fileError && (
            <Text size="sm" c="red.7" role="alert">
              {fileError}
            </Text>
          )}
        </Stack>

        <Paper withBorder radius="md" p="sm" bg="gray.0">
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('settlementForm.advance')}
              </Text>
              <Text size="sm">{money(advance.amount)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('settlementForm.total')}
              </Text>
              <Text size="sm">{money(spent)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={700} aria-live="polite">
                {balance.kind === 'RETURN' && t('settlementForm.returnAmount')}
                {balance.kind === 'EXTRA' && t('settlementForm.extraAmount')}
                {balance.kind === 'EVEN' && t('settlementForm.evenAmount')}
              </Text>
              <Text size="sm" fw={700}>
                {money(balance.amount)}
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </DialogFrame>
  );
}
