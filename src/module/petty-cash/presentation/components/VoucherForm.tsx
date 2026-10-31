import { useRef, useState, type ReactNode } from 'react';
import { Grid, Group, Paper, Stack, Switch, Text, TextInput, ThemeIcon } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import {
  IconCalendar,
  IconFileInvoice,
  IconListDetails,
  IconPaperclip,
  IconReceiptTax,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type {
  PettyCashFund,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import {
  draftFromVoucher,
  draftNet,
  emptyDraft,
  toVoucherInput,
  validateAttachmentFiles,
  validateVoucherDraft,
  type VoucherDraft,
} from '@/module/petty-cash/domain/voucherForm';
import { AttachmentDeleteDialog } from '@/module/petty-cash/presentation/components/AttachmentDeleteDialog';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { VoucherAttachmentsField } from '@/module/petty-cash/presentation/components/VoucherAttachmentsField';
import { VoucherFormSummary } from '@/module/petty-cash/presentation/components/VoucherFormSummary';
import { VoucherLinesEditor } from '@/module/petty-cash/presentation/components/VoucherLinesEditor';
import { useOpenAttachment } from '@/module/petty-cash/presentation/hooks/useOpenAttachment';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import {
  useCreateVoucher,
  useDeleteVoucherAttachment,
  useUpdateVoucher,
  useVoucherDecision,
} from '@/module/petty-cash/presentation/hooks/useVoucherMutations';

interface Props {
  fund: PettyCashFund;
  /** Present when editing a draft or rejected voucher. */
  voucher?: PettyCashVoucherRecord;
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: Readonly<{ icon: ReactNode; title: string; subtitle: string; children: ReactNode }>) {
  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group gap="sm" mb="md" wrap="nowrap">
        <ThemeIcon size={36} radius="md" variant="light" color="primary">
          {icon}
        </ThemeIcon>
        <div>
          <Text fw={700} fz={15}>
            {title}
          </Text>
          <Text fz={12} c="dimmed">
            {subtitle}
          </Text>
        </div>
      </Group>
      {children}
    </Paper>
  );
}

/** Record or edit a petty cash voucher: information, expense lines, optional tax invoice and receipts. */
export function VoucherForm({ fund, voucher }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const today = dayjs().format('YYYY-MM-DD');
  const lookups = usePettyCashLookups();
  const create = useCreateVoucher(fund.id);
  const update = useUpdateVoucher(voucher?.id ?? '');
  const submitStep = useVoucherDecision(voucher?.id ?? '', 'submit');
  const detach = useDeleteVoucherAttachment(voucher?.id ?? '');
  const { open } = useOpenAttachment();

  const [draft, setDraft] = useState<VoucherDraft>(() =>
    voucher ? draftFromVoucher(voucher) : emptyDraft(today)
  );
  const [files, setFiles] = useState<File[]>([]);
  const [taxOpen, setTaxOpen] = useState(
    Boolean(voucher?.taxInvoiceNumber || voucher?.vendorTaxId)
  );
  const [showIssues, setShowIssues] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  /** Fingerprint of the last edit that reached the backend, so a retried submit does not save again. */
  const savedRef = useRef<string | null>(null);

  const existing = voucher?.attachments ?? [];
  const issues = validateVoucherDraft(draft, today);
  const fileIssues = validateAttachmentFiles(files, existing.length);
  const pending = create.isPending || update.isPending || submitStep.isPending;
  const hasTax = draft.lines.some((line) => Boolean(line.taxId));

  // An existing voucher may use an account or tax that is no longer offered; keep it selectable so
  // it is not shown blank and still posted.
  const lookupData = lookups.data && {
    ...lookups.data,
    expenseAccounts: [
      ...lookups.data.expenseAccounts,
      ...(voucher?.lines ?? [])
        .map((line) => line.expenseAccount)
        .filter(
          (account): account is NonNullable<typeof account> =>
            account !== null && !lookups.data.expenseAccounts.some((item) => item.id === account.id)
        ),
    ],
    taxes: [
      ...lookups.data.taxes,
      ...(voucher?.lines ?? [])
        .map((line) => line.tax)
        .filter(
          (tax): tax is NonNullable<typeof tax> =>
            tax !== null && !lookups.data.taxes.some((item) => item.id === tax.id)
        ),
    ],
  };

  const errorFor = (path: string) => {
    const issue = showIssues ? issues.find((item) => item.path === path) : undefined;
    return issue ? t(`form.issues.${issue.code}`) : undefined;
  };
  const patch = (changes: Partial<VoucherDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const toggleTax = (on: boolean) => {
    setTaxOpen(on);
    if (!on) {
      setDraft((current) => ({
        ...current,
        taxInvoiceNumber: '',
        vendorTaxId: '',
        lines: current.lines.map((line) => ({ ...line, taxId: null })),
      }));
    }
  };

  const focusFirstInvalid = () =>
    window.setTimeout(
      () => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      0
    );

  const save = async (submit: boolean) => {
    setShowIssues(true);
    if (issues.length > 0 || fileIssues.length > 0) {
      focusFirstInvalid();
      return;
    }
    const input = toVoucherInput(draft);
    const done = () => navigate(`${routes.pettyCash.main}?fund=${fund.id}`);
    try {
      if (!voucher) {
        await create.mutateAsync({ input, submit, files });
      } else {
        // Save, then submit as its own step: a failed submit is retried without saving again or
        // uploading the same receipts twice.
        const fingerprint = JSON.stringify(input);
        if (savedRef.current !== fingerprint || files.length > 0) {
          await update.mutateAsync({ input, files, announce: !submit });
          savedRef.current = fingerprint;
          setFiles([]);
        }
        if (submit) await submitStep.mutateAsync({});
      }
      done();
    } catch {
      // the hooks already told the user what went wrong
    }
  };

  return (
    <div ref={formRef}>
      {lookups.isError && (
        <QueryErrorState
          title={t('form.lookupsFailed')}
          error={lookups.error}
          onRetry={() => lookups.refetch()}
        />
      )}
      <Grid gutter="lg" align="flex-start" mt={lookups.isError ? 'md' : 0}>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={<IconFileInvoice size={18} />}
              title={t('form.infoTitle')}
              subtitle={t('form.infoSubtitle')}
            >
              <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DatePickerInput
                    label={t('form.date')}
                    value={draft.date || null}
                    onChange={(value) => patch({ date: value ?? '' })}
                    maxDate={today}
                    valueFormat="DD/MM/YYYY"
                    leftSection={<IconCalendar size={16} />}
                    error={errorFor('date')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('form.beneficiary')}
                    placeholder={t('form.beneficiaryPlaceholder')}
                    value={draft.beneficiary}
                    onChange={(event) => patch({ beneficiary: event.currentTarget.value })}
                    error={errorFor('beneficiary')}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('form.receipt')}
                    placeholder={t('form.receiptPlaceholder')}
                    value={draft.receiptNumber}
                    onChange={(event) => patch({ receiptNumber: event.currentTarget.value })}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('form.description')}
                    placeholder={t('form.descriptionPlaceholder')}
                    value={draft.description}
                    onChange={(event) => patch({ description: event.currentTarget.value })}
                  />
                </Grid.Col>
              </Grid>
            </SectionCard>

            <SectionCard
              icon={<IconListDetails size={18} />}
              title={t('form.linesTitle')}
              subtitle={t('form.linesSubtitle')}
            >
              <VoucherLinesEditor
                lines={draft.lines}
                lookups={lookupData}
                taxEnabled={taxOpen}
                errorFor={errorFor}
                onChange={(lines) => patch({ lines })}
              />
            </SectionCard>

            <SectionCard
              icon={<IconReceiptTax size={18} />}
              title={t('form.taxInvoiceTitle')}
              subtitle={t('form.taxInvoiceHint')}
            >
              <Stack gap="sm">
                <Switch
                  checked={taxOpen}
                  onChange={(event) => toggleTax(event.currentTarget.checked)}
                  label={t('form.taxInvoiceToggle')}
                />
                {taxOpen && (
                  <Grid gutter="sm">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('form.taxInvoice')}
                        value={draft.taxInvoiceNumber}
                        onChange={(event) => patch({ taxInvoiceNumber: event.currentTarget.value })}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('form.vendorTaxId')}
                        value={draft.vendorTaxId}
                        onChange={(event) => patch({ vendorTaxId: event.currentTarget.value })}
                      />
                    </Grid.Col>
                  </Grid>
                )}
              </Stack>
            </SectionCard>

            <SectionCard
              icon={<IconPaperclip size={18} />}
              title={t('form.attachmentsTitle')}
              subtitle={t('form.attachmentsSubtitle')}
            >
              <VoucherAttachmentsField
                existing={existing}
                files={files}
                error={fileIssues
                  .map((issue) => t(`form.fileIssues.${issue.code}`, { name: issue.name }))
                  .join(' ')}
                onChange={setFiles}
                onOpenExisting={open}
                onDeleteExisting={
                  voucher
                    ? (attachmentId) =>
                        setToDelete({
                          id: attachmentId,
                          name: existing.find((item) => item.id === attachmentId)?.fileName ?? '',
                        })
                    : undefined
                }
              />
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <div style={{ position: 'sticky', top: 20 }}>
            <VoucherFormSummary
              fund={fund}
              net={draftNet(draft)}
              hasTax={hasTax}
              hasAttachment={files.length + existing.length > 0}
              pending={pending}
              showIssues={showIssues && (issues.length > 0 || fileIssues.length > 0)}
              onCancel={() => navigate(`${routes.pettyCash.main}?fund=${fund.id}`)}
              onSaveDraft={() => save(false)}
              onSubmit={() => save(true)}
            />
          </div>
        </Grid.Col>
      </Grid>
      <AttachmentDeleteDialog
        fileName={toDelete?.name ?? null}
        loading={detach.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          detach.mutate({ attachmentId: toDelete.id }, { onSettled: () => setToDelete(null) })
        }
      />
    </div>
  );
}
