import { useEffect, useRef, useState } from 'react';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { billNewFilesMissing } from '@/module/purchases/domain/billVerify';
import {
  IconDeviceFloppy,
  IconFileInvoice,
  IconListDetails,
  IconRosetteDiscountCheck,
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
  type BillQuantities,
  type BillSourceDoc,
  type PickedSource,
} from '@/module/purchases/domain/billSources';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import type {
  BillSource,
  BillVariance,
  PurchaseBill,
} from '@/module/purchases/domain/purchaseDocuments';
import { toPurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import type { BillFiles } from '@/module/purchases/presentation/components/bills/BillFileFields';
import { BillDataStep } from '@/module/purchases/presentation/components/bills/BillDataStep';
import { BillDraftHeaderForm } from '@/module/purchases/presentation/components/bills/BillDraftHeaderForm';
import { BillManualLines } from '@/module/purchases/presentation/components/bills/BillManualLines';
import { BillVarianceDialog } from '@/module/purchases/presentation/components/bills/BillVarianceDialog';
import { effectiveVendor } from '@/module/purchases/presentation/components/bills/BillSourcePicker';
import {
  BillEstimateSummary,
  BillPickedItems,
} from '@/module/purchases/presentation/components/bills/BillPickedItems';
import { BillSourceStep } from '@/module/purchases/presentation/components/bills/BillSourceStep';
import { useBillPricing } from '@/module/purchases/presentation/components/bills/useBillPricing';
import { useBillPriceChange } from '@/module/purchases/presentation/components/bills/useBillPriceChange';
import { BillPriceChangeDialog } from '@/module/purchases/presentation/components/bills/BillPriceChangeDialog';
import { BillPriceChangeState } from '@/module/purchases/presentation/components/bills/BillPriceChangeState';
import { BillWizardSteps } from '@/module/purchases/presentation/components/bills/BillWizardSteps';
import { useBillDueHint } from '@/module/purchases/presentation/components/bills/useBillDueHint';
import { useUpdateBill } from '@/module/purchases/presentation/components/bills/useUpdateBill';
import { FormFrame } from '@/module/purchases/presentation/components/shared/FormFrame';
import { WizardActionBar } from '@/module/purchases/presentation/components/shared/wizard/WizardActionBar';
import { WizardCard } from '@/module/purchases/presentation/components/shared/wizard/WizardCard';
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
      // A refused upload leaves the saved bill as a draft; do not attempt verification with missing files.
      try {
        await uploadFiles.mutateAsync({ id: doc.id, files: { invoice, tax } });
      } catch {
        navigate(detailOf(doc.id));
        return;
      }
    }
    if (verifyAfterRef.current) await verifySaved(doc.id, false);
    else navigate(detailOf(doc.id));
  });
  const update = useUpdateBill(async (doc) => {
    const selected = filesRef.current;
    if (selected.invoice.length || selected.tax.length) {
      const uploaded = await uploadFiles.mutateAsync({ id: doc.id, files: selected }).then(
        () => true,
        () => false
      );
      if (!uploaded) return;
    }
    navigate(detailOf(doc.id));
  });
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
  const pricing = useBillPricing(source, values, picked, quantities);
  const { estimate, preview, hasQuantity } = pricing;
  const priceChange = useBillPriceChange(source, values, picked, pricing);
  const saveBlocked = !existing && !priceChange.gate.canSave;
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

  const hasHeaderErrors = Object.keys(errors.fields).some(
    (key) => key !== 'vendorId' && key !== 'lines'
  );
  const save = (post: boolean) => {
    if (!existing && !priceChange.gate.canSave) return;
    if (hasBillErrors(errors) || pickError || quantityError) {
      setShowErrors(true);
      if (!existing) {
        setStep(pickError || errors.fields.vendorId ? 0 : hasHeaderErrors ? 1 : 2);
      }
      return;
    }
    if (
      !existing &&
      post &&
      billNewFilesMissing(
        files.invoice.length,
        files.tax.length,
        preview?.taxAmount ?? estimate.tax
      )
    ) {
      notifications.show({ color: 'orange', message: t('bills.form.file.verifyRequired') });
      setStep(1);
      return;
    }
    if (existing) {
      update.mutate({ id: existing.id, input: toBillUpdate(values, existing.source) });
      return;
    }
    verifyAfterRef.current = post;
    create.mutate(toBillInput(source, values, picked, false, quantities));
  };

  const dueHint = useBillDueHint(picked, values.date, currentLanguage);

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
        disabled: saveBlocked,
      }}
      finish={{
        label: t('bills.form.saveVerify'),
        icon: <IconRosetteDiscountCheck size={16} />,
        loading: pending,
        disabled: saveBlocked,
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
      <BillDraftHeaderForm
        existing={existing}
        values={values}
        errors={errors}
        showErrors={showErrors}
        pending={pending}
        dueHint={dueHint}
        files={files}
        onFilesChange={setFiles}
        onChange={set}
        onCancel={cancel}
        onSave={() => save(false)}
      />
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
      <BillWizardSteps active={step} onStepClick={setStep} />

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
        <BillDataStep
          vendorName={picked[0]?.vendor.name ?? (values.vendorName || undefined)}
          documents={picked.map((doc) => doc.number).join(', ') || undefined}
          footer={bar(false)}
          header={{ source, values, errors, showErrors, dueHint, onChange: set }}
          attachments={{
            files,
            onChange: setFiles,
            taxRequired: (preview?.taxAmount ?? estimate.tax) > 0,
          }}
        />
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
              {picked.length > 0 && (
                <BillPriceChangeState
                  sourceIsManual={false}
                  gate={priceChange.gate}
                  orderId={priceChange.orderId}
                  orderNumber={priceChange.orderNumber}
                  vendorInvoiceTotal={values.vendorInvoiceTotal}
                  previewTotal={preview?.total}
                  previewReady={pricing.previewReady}
                  previewLoading={pricing.previewLoading}
                  previewError={pricing.previewError}
                  refreshLoading={priceChange.order.isFetching || pricing.previewLoading}
                  pendingRequest={priceChange.pendingRequest}
                  requestDisabled={priceChange.requestDisabled || !priceChange.gate.canRequest}
                  onRequest={() => priceChange.setDialogOpened(true)}
                  onRefresh={() => {
                    priceChange.refreshStatus().catch(() => undefined);
                  }}
                />
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
      <BillPriceChangeDialog
        opened={priceChange.dialogOpened}
        orderNumber={priceChange.orderNumber}
        orderItems={priceChange.order.data?.items ?? []}
        invoiceNumber={values.vendorInvoiceNumber}
        invoiceTotal={values.vendorInvoiceTotal}
        orderLoading={priceChange.order.isLoading}
        orderError={priceChange.order.isError}
        loading={priceChange.mutation.isPending}
        onRetryOrder={() => {
          priceChange.order.refetch();
        }}
        onClose={() => priceChange.setDialogOpened(false)}
        onSubmit={(input) => {
          priceChange.submit(input).catch(() => undefined);
        }}
      />
      {dialog}
    </FormFrame>
  );
};
