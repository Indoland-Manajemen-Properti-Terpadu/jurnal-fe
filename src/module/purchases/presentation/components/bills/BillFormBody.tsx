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
  type BillQuantities,
  type BillSourceDoc,
  type PickedSource,
} from '@/module/purchases/domain/billSources';
import { formatDay, todayIso } from '@/module/purchases/presentation/components/shared/format';
import type {
  BillSource,
  BillVariance,
  PurchaseBill,
} from '@/module/purchases/domain/purchaseDocuments';
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
import { useBillPricing } from '@/module/purchases/presentation/components/bills/useBillPricing';
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
  useUploadBillFiles,
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
  const [quantities, setQuantities] = useState<BillQuantities>({});
  const [pickVendor, setPickVendor] = useState('');
  const [values, setValues] = useState<BillFormValues>(() =>
    existing ? billToForm(existing) : emptyBillForm(todayIso())
  );
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState(0);
  const [variances, setVariances] = useState<BillVariance[] | null>(null);
  // A refused verification that lists differences is answered here, with a question, not a message.
  const uploadFiles = useUploadBillFiles();
  const [files, setFiles] = useState<BillFiles>({ invoice: [], tax: [] });
  const filesRef = useRef(files);
  filesRef.current = files;
  // "Save and verify" saves a draft first: the service checks the files when it verifies, and they
  // can only go to a bill that exists. Verifying comes after the files are sent.
  const verifyAfterRef = useRef(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const isVarianceRefusal = (error: unknown) =>
    readVariances(toPurchaseError(error).details).length > 0;
  const verify = useVerifyBill(isVarianceRefusal);
  const verifySaved = async (id: string, acknowledgeVariance: boolean) => {
    try {
      await verify.mutateAsync({ id, acknowledgeVariance });
    } catch (error) {
      const found = readVariances(toPurchaseError(error).details);
      if (found.length > 0) {
        setSavedId(id);
        setVariances(found);
        return;
      }
    }
    navigate(detailOf(id));
  };
  const create = useCreateBill(async (doc) => {
    const { invoice, tax } = filesRef.current;
    if (invoice.length > 0 || tax.length > 0) {
      // A refused upload is reported by the hook; the saved bill stays a draft to fix on its page.
      await uploadFiles.mutateAsync({ id: doc.id, files: { invoice, tax } }).catch(() => undefined);
    }
    if (verifyAfterRef.current) await verifySaved(doc.id, false);
    else navigate(detailOf(doc.id));
  });
  const update = useUpdateBill((doc) => navigate(detailOf(doc.id)));
  const pending = create.isPending || update.isPending || verify.isPending || uploadFiles.isPending;

  const pickable: PickedSource | null = source === 'MANUAL' ? null : source;
  const sources = useBillSources(
    existing ? null : pickable,
    undefined,
    pickable === 'ORDER' ? preselect.order : undefined
  );
  const shownVendorName = sources.data?.find(
    (doc) => doc.vendor.id === effectiveVendor(sources.data ?? [], picked, pickVendor)
  )?.vendor.name;

  // A document the page was opened for starts picked, once the ready ones are known.
  const wanted =
    source === 'RECEIPT' ? preselect.receipt : source === 'ORDER' ? preselect.order : undefined;
  useEffect(() => {
    if (!wanted || picked.length > 0 || !sources.data) return;
    const found = sources.data.find(
      (doc) => doc.id === wanted || doc.orderId === wanted || (source === 'ORDER' && doc.selected)
    );
    if (found) setPicked([found]);
    // Only the first load of the ready documents preselects; later picks are the person's own.
  }, [wanted, sources.data]);

  const errors = validateBillForm(values, source, {
    subtotal: existing?.subtotal,
    headerOnly: Boolean(existing),
  });
  const { estimate, preview, hasQuantity } = useBillPricing(source, values, picked, quantities);
  const pickError = !existing && source !== 'MANUAL' && picked.length === 0;
  const quantityError = !existing && source !== 'MANUAL' && picked.length > 0 && !hasQuantity;
  const set = <K extends keyof BillFormValues>(key: K, value: BillFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const changeSource = (next: BillSource) => {
    setSource(next);
    setPicked([]);
    setQuantities({});
    setPickVendor('');
    setShowErrors(false);
  };

  const hasHeaderFieldErrors = Object.keys(errors.fields).some(
    (key) => key !== 'vendorId' && key !== 'lines'
  );
  const save = (post: boolean) => {
    if (hasBillErrors(errors) || pickError || quantityError) {
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
    verifyAfterRef.current = post;
    create.mutate(toBillInput(source, values, picked, false, quantities));
  };

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
        loading: pending && !verifyAfterRef.current,
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
      loading={verify.isPending}
      onClose={() => {
        // The bill is saved as a draft already; closing the question leaves it there.
        setVariances(null);
        if (savedId) navigate(detailOf(savedId));
      }}
      onConfirm={() => {
        if (!savedId) return;
        setVariances(null);
        verifySaved(savedId, true).catch(() => undefined);
      }}
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
          order={preselect.order}
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
          summary={
            source === 'MANUAL' ? undefined : (
              <BillEstimateSummary estimate={estimate} preview={preview} />
            )
          }
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
            <>
              <BillPickedItems
                estimate={estimate}
                onQuantity={(key, quantity) =>
                  setQuantities((current) => ({ ...current, [key]: quantity }))
                }
              />
              {showErrors && quantityError && (
                <Text size="sm" c="red" mt="sm" role="alert">
                  {t('bills.form.error.qtyEmpty')}
                </Text>
              )}
            </>
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
