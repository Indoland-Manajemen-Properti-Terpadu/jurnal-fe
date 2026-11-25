import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Group, Paper, Select, SimpleGrid, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBuildingWarehouse,
  IconNotes,
  IconPackage,
  IconTransfer,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  availableQty,
  fillAllLines,
  transferWarehouseChoices,
  validateTransfer,
  withoutIssue,
  type TransferIssues,
  type TransferLine,
} from '@/module/inventory/domain/stockTransfer';
import {
  FormHeader,
  PageFrame,
} from '@/module/inventory/presentation/components/shared/DetailFrame';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import { DateField } from '@/module/inventory/presentation/components/shared/DateField';
import { transferDetailPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import {
  TransferLinesEditor,
  type ProductOption,
} from '@/module/inventory/presentation/components/stock/TransferLinesEditor';
import { WarehouseConfirmDialog } from '@/module/inventory/presentation/components/warehouses/WarehouseActionDialogs';
import {
  useBalances,
  useStockErrorMessage,
} from '@/module/inventory/presentation/hooks/useStockQueries';
import { useFrozenWarehouses } from '@/module/inventory/presentation/hooks/useOpnames';
import { useTransferMutations } from '@/module/inventory/presentation/hooks/useTransferMutations';
import {
  ALL_ACTIVE_WAREHOUSES,
  useWarehouseList,
} from '@/module/inventory/presentation/hooks/useWarehouses';
import { routes } from '@/router/routes';

const NO_ISSUES: TransferIssues = { lines: {} };

/** The transfer form: date, source and destination, the products to move, and a note. */
export default function TransferFormPage() {
  const { t } = useTranslation('stockMovements');
  const { t: tf } = useTranslation('stockTake');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const describe = useStockErrorMessage();
  const { create } = useTransferMutations();

  const today = dayjs().format('YYYY-MM-DD');
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState(params.get('from') ?? '');
  const [to, setTo] = useState('');
  const [memo, setMemo] = useState('');
  const [lines, setLines] = useState<TransferLine[]>([]);
  const [issues, setIssues] = useState<TransferIssues>(NO_ISSUES);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const filled = useRef(false);

  const warehouses = useWarehouseList(ALL_ACTIVE_WAREHOUSES);
  const frozen = useFrozenWarehouses();
  const frozenBy = frozen.get(from) ?? frozen.get(to);
  const balances = useBalances(
    { asOf: date === today ? undefined : date, warehouse: from || undefined },
    from !== ''
  );
  const report = from ? balances.data : undefined;

  const options = useMemo<ProductOption[]>(
    () =>
      (report?.rows ?? [])
        .filter((row) => (row.quantities[from] ?? 0) > 0)
        .map((row) => ({
          value: row.productId,
          label: row.name,
          unit: row.unit,
          available: row.quantities[from] ?? 0,
        })),
    [report, from]
  );

  // A link from a warehouse that cannot be switched off fills in everything it still holds.
  useEffect(() => {
    if (filled.current || params.get('fill') !== 'all' || !report || !from) return;
    filled.current = true;
    setLines(fillAllLines(report, from));
  }, [report, from, params]);

  const holderOf = (id: string) => frozen.get(id);
  const frozenLabel = (number: string) => tf('frozen.warehouse', { number });
  const warehouseList = warehouses.data?.items ?? [];
  const fromOptions = transferWarehouseChoices(warehouseList, holderOf, to, frozenLabel);
  const toOptions = transferWarehouseChoices(warehouseList, holderOf, from, frozenLabel);

  const changeFrom = (value: string) => {
    if (value === from) return;
    setIssues((current) => withoutIssue(current, 'from'));
    if (lines.length > 0) setPendingFrom(value);
    else setFrom(value);
  };

  const submit = () => {
    const input = { date, fromWarehouse: from, toWarehouse: to, memo, lines };
    const found = validateTransfer(
      input,
      (productId) => (report ? availableQty(report, productId, from) : 0),
      today
    );
    setIssues(found);
    const hasIssue =
      found.date || found.from || found.to || found.noLines || Object.keys(found.lines).length > 0;
    if (hasIssue) return;
    create.mutate(input, {
      onSuccess: (transfer) => {
        notifications.show({
          color: 'green',
          message: t(transfer.status === 'pending' ? 'form.requested' : 'form.saved', {
            number: transfer.number,
            count: transfer.productCount,
            to: transfer.to.name,
          }),
        });
        navigate(transferDetailPath(transfer.id));
      },
    });
  };

  const issueText = (key: string | undefined) => (key ? t(`validation.${key}`) : undefined);

  return (
    <PageFrame backTo={routes.inventory.stockMovements} backLabel={t('form.back')}>
      <FormHeader icon={IconTransfer} title={t('form.title')} description={t('form.description')} />
      {frozenBy && (
        <Alert color="orange" variant="light" icon={<IconAlertCircle size={18} />}>
          {tf('frozen.banner', { number: frozenBy.number })}
        </Alert>
      )}
      {create.isError && (
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertCircle size={18} />}
          title={t('form.failedTitle')}
        >
          {describe(create.error)}
        </Alert>
      )}
      <SectionCard
        icon={IconBuildingWarehouse}
        title={t('form.documentTitle')}
        subtitle={t('form.documentSubtitle')}
      >
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <DateField
            label={t('form.date')}
            required
            value={date}
            maxDate={today}
            onChange={(value) => {
              setDate(value);
              setIssues((current) => withoutIssue(current, 'date'));
            }}
            error={issueText(issues.date)}
          />
          <Select
            label={t('form.from')}
            placeholder={t('form.pickWarehouse')}
            required
            data={fromOptions}
            value={from || null}
            onChange={(value) => changeFrom(value ?? '')}
            error={issueText(issues.from)}
            searchable
            radius="md"
          />
          <Select
            label={t('form.to')}
            placeholder={t('form.pickWarehouse')}
            required
            data={toOptions}
            value={to || null}
            onChange={(value) => {
              setTo(value ?? '');
              setIssues((current) => withoutIssue(current, 'to'));
            }}
            error={issueText(issues.to)}
            searchable
            radius="md"
          />
        </SimpleGrid>
      </SectionCard>
      <SectionCard
        icon={IconPackage}
        title={t('form.itemsTitle')}
        subtitle={t('form.itemsSubtitle')}
      >
        <TransferLinesEditor
          lines={lines}
          options={options}
          sourceChosen={from !== ''}
          issues={issues.lines}
          noLines={issues.noLines === true}
          onChange={(next) => {
            setLines(next);
            setIssues(NO_ISSUES);
          }}
        />
      </SectionCard>
      <SectionCard icon={IconNotes} title={t('form.memoTitle')}>
        <Textarea
          aria-label={t('form.memo')}
          placeholder={t('form.memoPlaceholder')}
          value={memo}
          onChange={(event) => setMemo(event.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={5}
        />
      </SectionCard>
      <Paper withBorder radius="lg" p="md" bg="white">
        <Group justify="space-between" gap="sm">
          <Button
            variant="default"
            disabled={create.isPending}
            onClick={() => navigate(routes.inventory.stockMovements)}
          >
            {t('form.cancel')}
          </Button>
          <Button
            color="primary"
            loading={create.isPending}
            disabled={frozenBy !== undefined}
            onClick={submit}
          >
            {t('form.submit')}
          </Button>
        </Group>
      </Paper>
      <WarehouseConfirmDialog
        opened={pendingFrom !== null}
        title={t('form.changeSourceTitle')}
        body={t('form.changeSourceBody')}
        confirmLabel={t('form.changeSourceConfirm')}
        cancelLabel={t('form.changeSourceKeep')}
        onConfirm={() => {
          setFrom(pendingFrom ?? '');
          setLines([]);
          setIssues(NO_ISSUES);
          setPendingFrom(null);
        }}
        onClose={() => setPendingFrom(null)}
      />
    </PageFrame>
  );
}
