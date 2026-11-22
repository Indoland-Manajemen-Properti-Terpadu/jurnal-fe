import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  MultiSelect,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Text,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconBuildingWarehouse,
  IconClipboardCheck,
  IconInfoCircle,
  IconListCheck,
  IconPlayerPlay,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  validateOpnameInput,
  type OpnameInputIssues,
  type OpnameScope,
} from '@/module/inventory/domain/stockOpname';
import { DateField } from '@/module/inventory/presentation/components/shared/DateField';
import {
  FormHeader,
  PageFrame,
} from '@/module/inventory/presentation/components/shared/DetailFrame';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import { stockTakeDetailPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import {
  useBusyWarehouses,
  useOpnameMutations,
  useStockTakeErrorMessage,
} from '@/module/inventory/presentation/hooks/useOpnames';
import { useBalances } from '@/module/inventory/presentation/hooks/useStockQueries';
import {
  ALL_ACTIVE_WAREHOUSES,
  usePicOptions,
  useWarehouseList,
} from '@/module/inventory/presentation/hooks/useWarehouses';
import { fetchCategories } from '@/module/products';
import { routes } from '@/router/routes';

type ScopeType = OpnameScope['type'];

const SCOPE_COPY = {
  all: { title: 'form.scopeAll', hint: 'form.scopeAllHint' },
  category: { title: 'form.scopeCategory', hint: 'form.scopeCategoryHint' },
  manual: { title: 'form.scopeManual', hint: 'form.scopeManualHint' },
} as const;

/** The new count: warehouse, date, who counts, and which products are on the list. */
export default function StockTakeFormPage() {
  const { t } = useTranslation('stockTake');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const describe = useStockTakeErrorMessage();
  const { create, step } = useOpnameMutations();

  const today = dayjs().format('YYYY-MM-DD');
  const [warehouse, setWarehouse] = useState(params.get('warehouse') ?? '');
  const [date, setDate] = useState(today);
  const [counter, setCounter] = useState('');
  const [notes, setNotes] = useState('');
  const [scopeType, setScopeType] = useState<ScopeType>('all');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const categories = useQuery({
    queryKey: ['inventory', 'category-options'],
    queryFn: () => fetchCategories(1, 100),
    staleTime: 60_000,
  });
  const [issues, setIssues] = useState<OpnameInputIssues>({});

  const warehouses = useWarehouseList(ALL_ACTIVE_WAREHOUSES);
  const busy = useBusyWarehouses();
  const people = usePicOptions();
  const balances = useBalances({ warehouse: warehouse || undefined }, warehouse !== '');

  const warehouseOptions = (warehouses.data?.items ?? []).map((item) => {
    const running = busy.get(item.id);
    const label = `${item.code} · ${item.name}`;
    return {
      value: item.id,
      label: running ? `${label} (${t('form.warehouseBusy', { number: running.number })})` : label,
      disabled: running !== undefined,
    };
  });
  const productOptions = (balances.data?.rows ?? [])
    .filter((row) => (row.quantities[warehouse] ?? 0) > 0)
    .map((row) => ({ value: row.productId, label: row.name }));

  const saving = create.isPending || step.isPending;
  const failure = create.error ?? step.error;

  const submit = (startNow: boolean) => {
    const input = {
      warehouse,
      date,
      scope: {
        type: scopeType,
        categoryIds: scopeType === 'category' ? categoryIds : [],
        productIds: scopeType === 'manual' ? productIds : [],
      },
      counterUser: counter,
      notes,
    };
    const found = validateOpnameInput(input, today, busy.has(warehouse));
    setIssues(found);
    if (Object.keys(found).length > 0) return;
    create.mutate(input, {
      onSuccess: (opname) => {
        notifications.show({ color: 'green', message: t('form.saved', { number: opname.number }) });
        if (!startNow) {
          navigate(stockTakeDetailPath(opname.id));
          return;
        }
        step.mutate(
          { id: opname.id, step: 'start' },
          { onSettled: () => navigate(stockTakeDetailPath(opname.id)) }
        );
      },
    });
  };

  const issueText = (key: string | undefined) => (key ? t(`validation.${key}`) : undefined);
  const toList = () => navigate(routes.inventory.stockTake);

  return (
    <PageFrame backTo={routes.inventory.stockTake} backLabel={t('detail.backToList')}>
      <FormHeader
        icon={IconClipboardCheck}
        title={t('form.title')}
        description={t('form.description')}
      />
      {failure && (
        <Alert
          color="red"
          variant="light"
          radius="md"
          icon={<IconAlertCircle size={18} />}
          title={t('form.failedTitle')}
        >
          {describe(failure)}
        </Alert>
      )}
      <SectionCard
        icon={IconBuildingWarehouse}
        title={t('form.documentTitle')}
        subtitle={t('form.documentSubtitle')}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label={t('form.warehouse')}
            placeholder={t('form.pickWarehouse')}
            description={busy.size > 0 ? t('form.warehouseHint') : undefined}
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            required
            data={warehouseOptions}
            value={warehouse || null}
            onChange={(value) => {
              setWarehouse(value ?? '');
              setProductIds([]);
              setIssues({});
            }}
            error={issueText(issues.warehouse)}
            searchable
            radius="md"
          />
          <DateField
            label={t('form.date')}
            description={t('form.dateHint')}
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            required
            value={date}
            maxDate={today}
            onChange={setDate}
            error={issueText(issues.date)}
          />
        </SimpleGrid>
      </SectionCard>
      <SectionCard
        icon={IconListCheck}
        title={t('form.scopeTitle')}
        subtitle={t('form.scopeSubtitle')}
      >
        <Radio.Group
          aria-label={t('form.scopeTitle')}
          value={scopeType}
          onChange={(value) => setScopeType(value as ScopeType)}
        >
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            {(['all', 'category', 'manual'] as const).map((value) => (
              <Radio.Card
                key={value}
                value={value}
                radius="md"
                p="md"
                style={{
                  borderColor: scopeType === value ? 'var(--mantine-color-primary-6)' : undefined,
                  background: scopeType === value ? 'var(--mantine-color-primary-0)' : undefined,
                }}
              >
                <Group wrap="nowrap" align="flex-start" gap="sm">
                  <Radio.Indicator mt={2} />
                  <div>
                    <Text size="sm" fw={600}>
                      {t(SCOPE_COPY[value].title)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t(SCOPE_COPY[value].hint)}
                    </Text>
                  </div>
                </Group>
              </Radio.Card>
            ))}
          </SimpleGrid>
        </Radio.Group>
        {scopeType === 'category' && (
          <MultiSelect
            label={t('form.categories')}
            placeholder={t('form.categoriesPlaceholder')}
            data={(categories.data?.items ?? []).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            value={categoryIds}
            onChange={setCategoryIds}
            error={issueText(issues.categories)}
            searchable
            clearable
            radius="md"
          />
        )}
        {scopeType === 'manual' && (
          <MultiSelect
            label={t('form.products')}
            placeholder={t('form.productsPlaceholder')}
            data={productOptions}
            value={productIds}
            onChange={setProductIds}
            error={issueText(issues.products)}
            disabled={warehouse === ''}
            searchable
            clearable
            radius="md"
          />
        )}
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <IconInfoCircle
            size={16}
            style={{ flexShrink: 0, marginTop: 2 }}
            color="var(--mantine-color-dimmed)"
          />
          <Text size="xs" c="dimmed">
            {t('form.freezeNote')}
          </Text>
        </Group>
      </SectionCard>
      <SectionCard
        icon={IconUsers}
        title={t('form.peopleTitle')}
        subtitle={t('form.peopleSubtitle')}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label={t('form.counter')}
            placeholder={t('form.pickCounter')}
            data={(people.data ?? []).map((person) => ({
              value: person.id,
              label: person.name,
            }))}
            value={counter || null}
            onChange={(value) => setCounter(value ?? '')}
            clearable
            searchable
            radius="md"
          />
        </SimpleGrid>
        <Textarea
          label={t('form.notes')}
          placeholder={t('form.notesPlaceholder')}
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={5}
        />
      </SectionCard>
      <Paper withBorder radius="lg" p="md" bg="white">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Button variant="default" disabled={saving} onClick={toList}>
            {t('form.cancel')}
          </Button>
          <Group gap="sm">
            <Button variant="default" disabled={saving} onClick={() => submit(false)}>
              {t('form.saveDraft')}
            </Button>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              loading={saving}
              onClick={() => submit(true)}
            >
              {t('form.start')}
            </Button>
          </Group>
        </Group>
      </Paper>
    </PageFrame>
  );
}
