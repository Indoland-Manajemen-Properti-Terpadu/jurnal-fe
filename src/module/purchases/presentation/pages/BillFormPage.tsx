import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Grid, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import {
  IconClipboardText,
  IconDeviceFloppy,
  IconFileInvoice,
  IconListDetails,
  IconRosetteDiscountCheck,
  IconSum,
} from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  togglePicked,
  type BillSourceDoc,
  type PickedSource,
} from '@/module/purchases/domain/billSources';
import { billActions } from '@/module/purchases/domain/purchaseActions';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import type {
  BillSource,
  BillVariance,
  PurchaseBill,
} from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseBillInput } from '@/module/purchases/domain/purchaseInputs';
import { toPurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import { BillHeaderFields } from '@/module/purchases/presentation/components/bills/BillHeaderFields';
import { BillManualLines } from '@/module/purchases/presentation/components/bills/BillManualLines';
import { BillVarianceDialog } from '@/module/purchases/presentation/components/bills/BillVarianceDialog';
import { BillSourcePicker } from '@/module/purchases/presentation/components/bills/BillSourcePicker';
import { useUpdateBill } from '@/module/purchases/presentation/components/bills/useUpdateBill';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCreateBill,
  useVerifyBill,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useBill, useBillSources } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const detailOf = (id: string) => routes.purchases.billDetail.replace(':id', id);
const SOURCES: BillSource[] = ['RECEIPT', 'ORDER', 'MANUAL'];

interface BodyProps {
  existing?: PurchaseBill;
  initialSource: BillSource;
  /** Documents to pick when the page opens (from an order or a receipt). */
  preselect: { receipt?: string; order?: string };
}

const BillFormBody = ({ existing, initialSource, preselect }: Readonly<BodyProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [source, setSource] = useState<BillSource>(existing?.source ?? initialSource);
  const [picked, setPicked] = useState<BillSourceDoc[]>([]);
  const [values, setValues] = useState<BillFormValues>(() =>
    existing ? billToForm(existing) : emptyBillForm(todayIso())
  );
  const [showErrors, setShowErrors] = useState(false);
  const [variances, setVariances] = useState<BillVariance[] | null>(null);
  const [lastInput, setLastInput] = useState<PurchaseBillInput | null>(null);
  // A refused verification that lists differences is answered here, with a question, not a message.
  const create = useCreateBill(
    (doc) => navigate(detailOf(doc.id)),
    (error) => readVariances(toPurchaseError(error).details).length > 0
  );
  const update = useUpdateBill((doc) => navigate(detailOf(doc.id)));
  const verify = useVerifyBill();
  const pending = create.isPending || update.isPending || verify.isPending;

  const pickable: PickedSource | null = source === 'MANUAL' ? null : source;
  const sources = useBillSources(existing ? null : pickable);

  // A document the page was opened for starts picked, once the ready ones are known.
  const wanted =
    source === 'RECEIPT' ? preselect.receipt : source === 'ORDER' ? preselect.order : undefined;
  useEffect(() => {
    if (!wanted || picked.length > 0 || !sources.data) return;
    const found = sources.data.find((doc) => doc.id === wanted || doc.orderId === wanted);
    if (found) setPicked([found]);
    // Only the first load of the ready documents preselects; later picks are the person's own.
  }, [wanted, sources.data]);

  const vendor = picked[0]?.vendor ?? null;
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
    setShowErrors(false);
  };

  const save = (post: boolean) => {
    if (hasBillErrors(errors) || pickError) {
      setShowErrors(true);
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

  const dueHint = useMemo(
    () => (picked[0] ? t('bills.form.dueDateFromTerm', { term: picked[0].termName }) : undefined),
    [picked, t]
  );

  return (
    <PageFrame
      icon={IconFileInvoice}
      title={
        existing
          ? t('bills.form.titleEdit', { number: existing.number })
          : t('bills.form.titleCreate')
      }
      description={existing ? t('bills.form.subtitleEdit') : t('bills.form.subtitleCreate')}
      backTo={existing ? detailOf(existing.id) : routes.purchases.bills}
      backLabel={t('common.back')}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {!existing && (
              <SectionCard
                icon={IconListDetails}
                title={t('bills.form.sourceTitle')}
                subtitle={t('bills.form.sourceSubtitle')}
              >
                <SegmentedControl
                  fullWidth
                  radius="md"
                  data={SOURCES.map((value) => ({
                    value,
                    label: t(`bills.form.source.${value}`),
                  }))}
                  value={source}
                  onChange={(value) => changeSource(value as BillSource)}
                />
                <Text size="sm" c="dimmed">
                  {t(`bills.form.sourceHint.${source}`)}
                </Text>
                {pickable && (
                  <BillSourcePicker
                    source={pickable}
                    picked={picked}
                    onToggle={(doc) => setPicked((current) => togglePicked(current, doc, pickable))}
                  />
                )}
                {showErrors && pickError && (
                  <Text size="sm" c="red" role="alert">
                    {t('bills.form.error.pickOne')}
                  </Text>
                )}
                {source === 'MANUAL' && (
                  <Stack gap="md">
                    <SupplierSelect
                      withAsterisk
                      label={t('bills.form.vendor')}
                      value={values.vendorId || null}
                      onChange={(id, party) => {
                        set('vendorId', id ?? '');
                        set('vendorName', party?.name ?? '');
                      }}
                      error={
                        showErrors && errors.fields.vendorId
                          ? t('bills.form.error.vendorRequired')
                          : undefined
                      }
                    />
                    <BillManualLines
                      lines={values.lines}
                      errors={errors}
                      showErrors={showErrors}
                      onChange={(lines) => set('lines', lines)}
                    />
                    <Alert color="blue" variant="light" radius="md">
                      {t('bills.form.manualNote')}
                    </Alert>
                  </Stack>
                )}
              </SectionCard>
            )}

            <SectionCard
              icon={IconClipboardText}
              title={t('bills.form.headerTitle')}
              subtitle={t('bills.form.headerSubtitle')}
            >
              <BillHeaderFields
                values={values}
                errors={errors}
                showErrors={showErrors}
                dueHint={dueHint}
                onChange={set}
              />
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} pos="sticky" top={20}>
          <SectionCard icon={IconSum} title={t('bills.form.summaryTitle')}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('bills.form.summarySource')}
                </Text>
                <Badge variant="light" color="gray" radius="sm">
                  {t(`bills.form.source.${source}`)}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('bills.form.vendor')}
                </Text>
                <Text size="sm" fw={600}>
                  {existing?.vendor.name ?? vendor?.name ?? values.vendorName ?? '-'}
                </Text>
              </Group>
              {source !== 'MANUAL' && !existing && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t('bills.form.summaryPicked')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {picked.length}
                  </Text>
                </Group>
              )}
              <Text size="xs" c="dimmed" mt="xs">
                {t(
                  existing
                    ? 'bills.form.summaryEditNote'
                    : source === 'MANUAL'
                      ? 'bills.form.summaryNoteManual'
                      : 'bills.form.summaryNote'
                )}
              </Text>
            </Stack>
            <Stack gap="xs">
              {!existing && (
                <Button
                  fullWidth
                  leftSection={<IconRosetteDiscountCheck size={16} />}
                  loading={pending}
                  onClick={() => save(true)}
                >
                  {t('bills.form.saveVerify')}
                </Button>
              )}
              <Button
                fullWidth
                variant={existing ? 'filled' : 'default'}
                leftSection={<IconDeviceFloppy size={16} />}
                loading={existing ? pending : false}
                disabled={pending && !existing}
                onClick={() => save(false)}
              >
                {existing ? t('common.save') : t('common.saveDraft')}
              </Button>
              <Button
                fullWidth
                variant="subtle"
                color="gray"
                disabled={pending}
                onClick={() => navigate(existing ? detailOf(existing.id) : routes.purchases.bills)}
              >
                {t('common.cancel')}
              </Button>
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>
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
    </PageFrame>
  );
};

export default function BillFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const bill = useBill(id);

  if (accessLoading || (id && bill.isLoading)) {
    return <StateFrame kind="loading" />;
  }
  if (!id) {
    if (!can(PURCHASE_MENU.documents, 'create')) return <StateFrame kind="noAccess" />;
    const receipt = params.get('receipt') ?? undefined;
    const order = params.get('order') ?? undefined;
    const initial: BillSource = receipt ? 'RECEIPT' : order ? 'ORDER' : 'RECEIPT';
    return (
      <BillFormBody
        initialSource={initial}
        preselect={{ receipt, order }}
        key={`${receipt}-${order}`}
      />
    );
  }
  if (bill.isError) {
    return bill.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" />
    ) : (
      <StateFrame
        kind="error"
        onRetry={() => {
          bill.refetch();
        }}
      />
    );
  }
  if (!bill.data) return <StateFrame kind="loading" />;
  if (!can(PURCHASE_MENU.documents, 'update')) {
    return <StateFrame kind="noAccess" backTo={detailOf(bill.data.id)} />;
  }
  if (!billActions(bill.data).edit) {
    return (
      <StateFrame
        kind="blocked"
        title={t('bills.form.notEditableTitle')}
        description={t('bills.form.notEditableDescription')}
        backTo={detailOf(bill.data.id)}
      />
    );
  }
  return (
    <BillFormBody
      key={bill.data.id}
      existing={bill.data}
      initialSource={bill.data.source}
      preselect={{}}
    />
  );
}
