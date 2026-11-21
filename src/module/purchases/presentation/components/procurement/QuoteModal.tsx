import { useEffect, useMemo, useState } from 'react';
import { Button, Divider, Grid, Text, Textarea, TextInput, NumberInput } from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type {
  Procurement,
  Quote,
  QuoteInput,
  ScoreKey,
} from '@/module/purchases/domain/procurement';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';
import {
  emptyQuoteForm,
  hasQuoteErrors,
  QUOTE_LIMITS,
  quoteToForm,
  toQuoteInput,
  validateQuoteForm,
  type QuoteFormLine,
  type QuoteFormValues,
} from '@/module/purchases/domain/quoteForm';
import { QuoteLinesSection } from '@/module/purchases/presentation/components/procurement/QuoteLinesSection';
import { QuoteScoresSection } from '@/module/purchases/presentation/components/procurement/QuoteScoresSection';
import { QuoteTermSection } from '@/module/purchases/presentation/components/procurement/QuoteTermSection';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { usePaymentTermOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = [
  MIME_TYPES.pdf,
  MIME_TYPES.doc,
  MIME_TYPES.docx,
  MIME_TYPES.xls,
  MIME_TYPES.xlsx,
  MIME_TYPES.png,
  MIME_TYPES.jpeg,
];

interface QuoteModalProps {
  opened: boolean;
  /** The quote being edited; null starts a new one. */
  quote: Quote | null;
  procurement: Procurement;
  items: RequestItem[];
  saving: boolean;
  onClose: () => void;
  onSave: (input: QuoteInput, files: File[]) => void;
}

const heading = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
    {text}
  </Text>
);

/** One vendor's quote: who, when, what it costs per item, on which terms, and how it scores. */
export const QuoteModal = ({
  opened,
  quote,
  procurement,
  items,
  saving,
  onClose,
  onSave,
}: Readonly<QuoteModalProps>) => {
  const { t } = useTranslation('purchases');
  const terms = usePaymentTermOptions();
  const [values, setValues] = useState<QuoteFormValues>(() => emptyQuoteForm(items));
  const [files, setFiles] = useState<File[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setValues(quote ? quoteToForm(quote, items) : emptyQuoteForm(items));
    setFiles([]);
    setShowErrors(false);
  }, [opened, quote, items]);

  const termOptions = terms.data ?? [];
  const term = termOptions.find((candidate) => candidate.id === values.paymentTermId);
  const bidding = procurement.route !== 'SINGLE';
  const takenVendors = useMemo(
    () =>
      new Set(procurement.quotes.filter((other) => other.id !== quote?.id).map((q) => q.vendor.id)),
    [procurement.quotes, quote]
  );
  const duplicate = Boolean(values.vendorId) && takenVendors.has(values.vendorId);
  const filesMissing = !quote && files.length === 0;
  const errors = validateQuoteForm(values, term, { filesMissing });
  const invalid = hasQuoteErrors(errors) || duplicate;

  const set = <K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const setLine = (requestItemId: string, patch: Partial<QuoteFormLine>) =>
    setValues((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.requestItemId === requestItemId ? { ...line, ...patch } : line
      ),
    }));

  const addFiles = (dropped: File[]) => {
    const next = [...files, ...dropped.filter((file) => !files.some((f) => f.name === file.name))];
    if (next.length > MAX_FILES) {
      notifications.show({
        color: 'orange',
        message: t('attachments.tooMany', { max: MAX_FILES }),
      });
      return;
    }
    setFiles(next);
  };

  const submit = () => {
    if (invalid) {
      setShowErrors(true);
      return;
    }
    onSave(toQuoteInput(values, term), files);
  };

  const fieldError = (key: keyof QuoteFormValues) =>
    showErrors && errors.fields[key]
      ? t(`procurement.quote.error.${errors.fields[key]}`, {
          max: key === 'number' ? QUOTE_LIMITS.number : QUOTE_LIMITS.warranty,
        })
      : undefined;

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      size="min(900px, 94vw)"
      scrollBody
      title={quote ? t('procurement.quote.titleEdit') : t('procurement.quote.titleAdd')}
      description={t('procurement.quote.description')}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button loading={saving} onClick={submit}>
            {t('procurement.quote.save')}
          </Button>
        </>
      }
    >
      {heading(t('procurement.quote.infoTitle'))}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <SupplierSelect
            withAsterisk
            label={t('procurement.quote.vendor')}
            value={values.vendorId || null}
            selected={quote ? quote.vendor : null}
            onChange={(id, vendor) => {
              set('vendorId', id ?? '');
              set('vendorName', vendor?.name ?? '');
            }}
            error={
              duplicate ? t('procurement.quote.error.vendorDuplicate') : fieldError('vendorId')
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            radius="md"
            label={t('procurement.quote.number')}
            placeholder={t('procurement.quote.numberPlaceholder')}
            value={values.number}
            onChange={(event) => set('number', event.currentTarget.value)}
            error={fieldError('number')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateField
            clearable
            label={t('procurement.quote.validUntil')}
            value={values.validUntil}
            onChange={(value) => set('validUntil', value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            withAsterisk
            radius="md"
            label={t('procurement.quote.leadDays')}
            placeholder={t('procurement.quote.leadDaysPlaceholder')}
            min={0}
            allowDecimal={false}
            allowNegative={false}
            hideControls
            value={values.leadDays}
            onChange={(value) => set('leadDays', value === '' ? '' : Number(value))}
            error={fieldError('leadDays')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            radius="md"
            label={t('procurement.quote.warranty')}
            placeholder={t('procurement.quote.warrantyPlaceholder')}
            value={values.warranty}
            onChange={(event) => set('warranty', event.currentTarget.value)}
            error={fieldError('warranty')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Textarea
            radius="md"
            autosize
            minRows={1}
            label={t('procurement.quote.descriptionLabel')}
            value={values.description}
            onChange={(event) => set('description', event.currentTarget.value)}
          />
        </Grid.Col>
      </Grid>
      <CustomDropzone
        title={t('procurement.quote.files')}
        description={t('procurement.quote.filesDrop')}
        subDescription={
          quote && quote.attachments.length > 0
            ? t('procurement.quote.filesKept', { count: quote.attachments.length })
            : t('procurement.quote.filesHint')
        }
        accept={ACCEPT}
        maxSize={MAX_BYTES}
        files={files}
        uploadedTitle={t('procurement.quote.filesChosen')}
        handleDrop={addFiles}
        onReject={() => notifications.show({ color: 'orange', message: t('attachments.tooLarge') })}
        onRemoveFile={(name) => setFiles(files.filter((file) => file.name !== name))}
      />
      {showErrors && errors.fields.id && (
        <Text size="xs" c="red">
          {t('procurement.quote.error.filesRequired')}
        </Text>
      )}

      <Divider />
      {heading(t('procurement.quote.pricesTitle'))}
      <QuoteLinesSection
        values={values}
        errors={errors}
        showErrors={showErrors}
        onLine={setLine}
        onChange={set}
      />

      <Divider />
      {heading(t('procurement.quote.termsTitle'))}
      <QuoteTermSection
        values={values}
        errors={errors}
        showErrors={showErrors}
        terms={termOptions}
        currentTermName={quote?.term?.name}
        onReplace={setValues}
        onChange={set}
      />

      {bidding && (
        <>
          <Divider />
          {heading(t('procurement.quote.scoresTitle'))}
          <QuoteScoresSection
            criteria={procurement.scoreCriteria}
            scores={values.scores}
            onChange={(key: ScoreKey, value: number) =>
              setValues((current) => ({ ...current, scores: { ...current.scores, [key]: value } }))
            }
          />
        </>
      )}
    </ModalFrame>
  );
};
