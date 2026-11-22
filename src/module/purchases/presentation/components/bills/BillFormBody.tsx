import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import {
  IconDeviceFloppy,
  IconFileInvoice,
  IconListDetails,
  IconRosetteDiscountCheck,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  billToForm,
  emptyBillForm,
  hasBillErrors,
  readVariances,
  toBillInput,
  toBillUpdate,
  validateBillForm,
  type BillFormValues,
} from '@/module/purchases/domain/billForm';
import {
  dueDateFor,
  estimateBill,
  type BillSourceDoc,
  type PickedSource,
} from '@/module/purchases/domain/billSources';
import { formatDay, todayIso } from '@/module/purchases/presentation/components/shared/format';
import type {
  BillSource,
  BillVariance,
  PurchaseBill,
} from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseBillInput } from '@/module/purchases/domain/purchaseInputs';
import { toPurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import {
  BillFileFields,
  type BillFiles,
} from '@/module/purchases/presentation/components/bills/BillFileFields';
import { BillHeaderFields } from '@/module/purchases/presentation/components/bills/BillHeaderFields';
import { BillManualLines } from '@/module/purchases/presentation/components/bills/BillManualLines';
import { BillVarianceDialog } from '@/module/purchases/presentation/components/bills/BillVarianceDialog';
import { effectiveVendor } from '@/module/purchases/presentation/components/bills/BillSourcePicker';
import {
  BillEstimateSummary,
  BillPickedItems,
} from '@/module/purchases/presentation/components/bills/BillPickedItems';
import { BillSourceStep } from '@/module/purchases/presentation/components/bills/BillSourceStep';
import { useUpdateBill } from '@/module/purchases/presentation/components/bills/useUpdateBill';
import { FormFrame } from '@/module/purchases/presentation/components/shared/FormFrame';
import { WizardActionBar } from '@/module/purchases/presentation/components/shared/wizard/WizardActionBar';
import { WizardCard } from '@/module/purchases/presentation/components/shared/wizard/WizardCard';
import {
  WizardStepper,
  type WizardStep,
} from '@/module/purchases/presentation/components/shared/wizard/WizardStepper';
import {
  useCreateBill,
  useUploadAttachments,
  useVerifyBill,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useBillSources } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const detailOf = (id: string) => routes.purchases.billDetail.replace(':id', id);
export interface BillFormBodyProps {
  existing?: PurchaseBill;
  initialSource: BillSource;
  /** Documents to pick when the page opens (from an order or a receipt). */
  preselect: { receipt?: string; order?: string };
}

export const BillFormBody = ({
  existing,
  initialSource,
  preselect,
}: Readonly<BillFormBodyProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const [source, setSource] = useState<BillSource>(existing?.source ?? initialSource);
  const [picked, setPicked] = useState<BillSourceDoc[]>([]);
  const [pickVendor, setPickVendor] = useState('');
  const [values, setValues] = useState<BillFormValues>(() =>
    existing ? billToForm(existing) : emptyBillForm(todayIso())
  );
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState(0);
  const [variances, setVariances] = useState<BillVariance[] | null>(null);
  const [lastInput, setLastInput] = useState<PurchaseBillInput | null>(null);
  // A refused verification that lists differences is answered here, with a question, not a message.
  const upload = useUploadAttachments();
  const [files, setFiles] = useState<BillFiles>({ invoice: [], tax: [] });
  const filesRef = useRef(files);
  filesRef.current = files;
  const create = useCreateBill(
    async (doc) => {
      // The files go to the saved bill first, so the detail opens with them listed.
      const { invoice, tax } = filesRef.current;
      const groups = [
        { kind: 'VENDOR_INVOICE' as const, files: invoice },
        { kind: 'TAX_INVOICE' as const, files: tax },
      ].filter((group) => group.files.length > 0);
      for (const group of groups) {
        await upload
          .mutateAsync({ target: 'bill', id: doc.id, files: group.files, kind: group.kind })
          .catch(() => undefined);
      }
      navigate(detailOf(doc.id));
    },
    (error) => readVariances(toPurchaseError(error).details).length > 0
  );
  const update = useUpdateBill((doc) => navigate(detailOf(doc.id)));
  const verify = useVerifyBill();
  const pending = create.isPending || update.isPending || verify.isPending;

  const pickable: PickedSource | null = source === 'MANUAL' ? null : source;
  const sources = useBillSources(existing ? null : pickable);
  const shownVendorName = sources.data?.find(
    (doc) => doc.vendor.id === effectiveVendor(sources.data ?? [], picked, pickVendor)
  )?.vendor.name;

  // A document the page was opened for starts picked, once the ready ones are known.
  const wanted =
    source === 'RECEIPT' ? preselect.receipt : source === 'ORDER' ? preselect.order : undefined;
  useEffect(() => {
    if (!wanted || picked.length > 0 || !sources.data) return;
    const found = sources.data.find((doc) => doc.id === wanted || doc.orderId === wanted);
    if (found) setPicked([found]);
    // Only the first load of the ready documents preselects; later picks are the person's own.
  }, [wanted, sources.data]);

  const errors = validateBillForm(values, source, {
    subtotal: existing?.subtotal,
    headerOnly: Boolean(existing),
  });
  const pickError = !existing && source !== 'MANUAL' && picked.length === 0;
  const set = <K extends keyof BillFormValues>(key: K, value: BillFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const changeSource = (next: BillSource) => {
    setSource(next);
    setPicked([]);
    setPickVendor('');
    setShowErrors(false);
  };

  const hasHeaderFieldErrors = Object.keys(errors.fields).some(
    (key) => key !== 'vendorId' && key !== 'lines'
  );
  const save = (post: boolean) => {
    if (hasBillErrors(errors) || pickError) {
      setShowErrors(true);
      if (!existing) {
        setStep(pickError || errors.fields.vendorId ? 0 : hasHeaderFieldErrors ? 1 : 2);
      }
      return;
    }
    if (existing) {
      update.mutate({ id: existing.id, input: toBillUpdate(values) });
      return;
    }
    const input = toBillInput(source, values, picked, post);
    setLastInput(input);
    create.mutate(input, {
      onError: (error) => {
        const found = readVariances(toPurchaseError(error).details);
        if (found.length > 0) setVariances(found);
      },
    });
  };

  const estimate = useMemo(() => estimateBill(picked), [picked]);
  const dueHint = useMemo(() => {
    const first = picked[0];
    if (!first) return undefined;
    const suggested = dueDateFor(first, values.date);
    return suggested
      ? t('bills.form.dueDateSuggested', {
          term: first.term.name,
          date: formatDay(suggested, currentLanguage),
        })
      : t('bills.form.dueDateFromTerm', { term: first.term.name });
  }, [picked, values.date, t, currentLanguage]);

  const steps: WizardStep[] = [
    {
      id: 'source',
      label: t('bills.wizard.source'),
      description: t('bills.wizard.sourceHint'),
      icon: <IconTruckDelivery size={20} />,
    },
    {
      id: 'data',
      label: t('bills.wizard.data'),
      description: t('bills.wizard.dataHint'),
      icon: <IconFileInvoice size={20} />,
    },
    {
      id: 'items',
      label: t('bills.wizard.items'),
      description: t('bills.wizard.itemsHint'),
      icon: <IconListDetails size={20} />,
    },
  ];
  const hasHeaderErrors = Object.keys(errors.fields).some(
    (key) => key !== 'vendorId' && key !== 'lines'
  );
  const stepOk = [
    source === 'MANUAL' ? Boolean(values.vendorId) : !pickError,
    !hasHeaderErrors,
    true,
  ];
  const next = () => {
    if (!stepOk[step]) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(step + 1);
  };
  const cancel = () => navigate(existing ? detailOf(existing.id) : routes.purchases.bills);
  const bar = (isLast: boolean) => (
    <WizardActionBar
      isFirst={step === 0}
      isLast={isLast}
      busy={pending}
      onCancel={cancel}
      onBack={() => setStep(step - 1)}
      onNext={next}
      nextDisabled={step === 0 && !existing && source !== 'MANUAL' && picked.length === 0}
      secondary={{
        label: t('common.saveDraft'),
        icon: <IconDeviceFloppy size={16} />,
        onClick: () => save(false),
        loading: create.isPending && !create.variables?.post,
      }}
      finish={{
        label: t('bills.form.saveVerify'),
        icon: <IconRosetteDiscountCheck size={16} />,
        loading: pending,
        onClick: () => save(true),
      }}
    />
  );

  const dialog = (
    <BillVarianceDialog
      variances={variances}
      loading={create.isPending}
      onClose={() => setVariances(null)}
      onConfirm={() =>
        lastInput &&
        create.mutate(
          { ...lastInput, acknowledgeVariance: true },
          { onSuccess: () => setVariances(null) }
        )
      }
    />
  );

  if (existing) {
    return (
      <FormFrame
        icon={IconFileInvoice}
        title={t('bills.form.titleEdit', { number: existing.number })}
        description={t('bills.form.subtitleEdit')}
        backTo={detailOf(existing.id)}
        backLabel={t('bills.detail.backToList')}
      >
        <WizardCard
          icon={<IconFileInvoice size={20} />}
          title={t('bills.wizard.data')}
          description={t('bills.wizard.dataHint')}
          footer={
            <Group justify="space-between">
              <Button variant="default" disabled={pending} onClick={cancel}>
                {t('common.cancel')}
              </Button>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                loading={pending}
                onClick={() => save(false)}
              >
                {t('common.save')}
              </Button>
            </Group>
          }
        >
          <BillHeaderFields
            values={values}
            errors={errors}
            showErrors={showErrors}
            dueHint={dueHint}
            onChange={set}
          />
        </WizardCard>
      </FormFrame>
    );
  }

  return (
    <FormFrame
      icon={IconFileInvoice}
      title={t('bills.wizard.title')}
      description={t('bills.form.subtitleCreate')}
      backTo={routes.purchases.bills}
      backLabel={t('bills.detail.backToList')}
    >
      <WizardStepper steps={steps} active={step} onStepClick={setStep} />

      {step === 0 && (
        <BillSourceStep
          source={source}
          picked={picked}
          pickVendor={pickVendor}
          values={values}
          errors={errors}
          showErrors={showErrors}
          pickError={pickError}
          footer={bar(false)}
          onSource={changeSource}
          onPickVendor={setPickVendor}
          onPicked={setPicked}
          onField={set}
          shownVendorName={shownVendorName}
        />
      )}

      {step === 1 && (
        <WizardCard
          icon={<IconFileInvoice size={20} />}
          title={t('bills.wizard.data')}
          description={t('bills.wizard.dataHint')}
          hintTitle={picked[0]?.vendor.name ?? (values.vendorName || undefined)}
          hint={picked.map((doc) => doc.number).join(', ') || undefined}
          footer={bar(false)}
        >
          <BillHeaderFields
            values={values}
            errors={errors}
            showErrors={showErrors}
            dueHint={dueHint}
            onChange={set}
          />
          <BillFileFields files={files} onChange={setFiles} />
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          icon={<IconListDetails size={20} />}
          title={t('bills.wizard.items')}
          description={t('bills.wizard.itemsHint')}
          hintTitle={picked[0]?.vendor.name ?? (values.vendorName || undefined)}
          hint={picked.map((doc) => doc.number).join(', ') || undefined}
          summary={source === 'MANUAL' ? undefined : <BillEstimateSummary estimate={estimate} />}
          footer={bar(true)}
        >
          {source === 'MANUAL' ? (
            <BillManualLines
              lines={values.lines}
              errors={errors}
              showErrors={showErrors}
              onChange={(lines) => set('lines', lines)}
            />
          ) : (
            <BillPickedItems estimate={estimate} />
          )}
          {showErrors && errors.fields.lines && source === 'MANUAL' && (
            <Text size="sm" c="red" mt="sm" role="alert">
              {t('bills.form.error.linesEmpty')}
            </Text>
          )}
        </WizardCard>
      )}
      {dialog}
    </FormFrame>
  );
};
