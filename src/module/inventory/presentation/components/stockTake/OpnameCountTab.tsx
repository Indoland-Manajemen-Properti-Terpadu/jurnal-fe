import { useMemo, useState } from 'react';
import { Group, Select, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconSearch } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  lineIssue,
  submitReadiness,
  type OpnameActions,
  type OpnameLine,
  type OpnameLineChange,
  type StockOpname,
} from '@/module/inventory/domain/stockOpname';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import { FoundProductPicker } from '@/module/inventory/presentation/components/stockTake/FoundProductPicker';
import { OpnameCountRow } from '@/module/inventory/presentation/components/stockTake/OpnameCountRow';

type Filter = 'all' | 'uncounted' | 'diff' | 'incomplete' | 'recount';

type Props = {
  opname: StockOpname;
  actions: OpnameActions;
  /** What the last save did: shown beside the filters so a person knows their entry is kept. */
  saveState: 'idle' | 'saving' | 'saved' | 'failed';
  addingFound: boolean;
  onSave: (change: OpnameLineChange) => void;
};

const MATCHERS: Record<Filter, (line: OpnameLine) => boolean> = {
  all: () => true,
  uncounted: (line) => line.countedQty === null,
  diff: (line) => (line.diffQty ?? 0) !== 0,
  incomplete: (line) => lineIssue(line) !== null,
  recount: (line) => line.needsRecount,
};

/** The products to count: a readiness line, filters with counts, and one row per product. */
export function OpnameCountTab({
  opname,
  actions,
  saveState,
  addingFound,
  onSave,
}: Readonly<Props>) {
  const { t } = useTranslation('stockTake');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const showValues = opname.canSeeValues;
  const editable = actions.fillCounts || actions.fillReasons;
  const readiness = submitReadiness(opname.lines);

  const filters: Filter[] = showValues
    ? ['all', 'uncounted', 'diff', 'incomplete', 'recount']
    : ['all', 'uncounted', 'recount'];
  const labelOf: Record<Filter, string> = {
    all: t('count.filterAll'),
    uncounted: t('count.filterUncounted'),
    diff: t('count.filterDiff'),
    incomplete: t('count.filterIncomplete'),
    recount: t('count.filterRecount'),
  };

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return opname.lines.filter(
      (line) =>
        MATCHERS[filter](line) &&
        (!needle || `${line.name} ${line.sku}`.toLowerCase().includes(needle))
    );
  }, [opname.lines, search, filter]);

  const columns = showValues ? 10 : 5;
  const showReadiness = actions.submit && opname.lines.length > 0;

  return (
    <Stack gap="md">
      {!showValues && (
        <Text size="sm" c="dimmed">
          {t('detail.blindNote')}
        </Text>
      )}
      {showReadiness && (
        <Group
          gap="sm"
          wrap="nowrap"
          px="md"
          py="sm"
          bg={readiness.ready ? 'green.0' : 'orange.0'}
          style={{
            borderRadius: 'var(--mantine-radius-md)',
            border: `1px solid var(--mantine-color-${readiness.ready ? 'green' : 'orange'}-2)`,
          }}
        >
          {readiness.ready ? (
            <IconCircleCheck size={18} color="var(--mantine-color-green-7)" />
          ) : (
            <IconAlertCircle size={18} color="var(--mantine-color-orange-7)" />
          )}
          <Text size="sm" c="dark.7">
            {readiness.ready
              ? t('count.ready')
              : [
                  t('count.notReady'),
                  [
                    readiness.uncounted > 0
                      ? t('count.notReadyUncounted', { count: readiness.uncounted })
                      : '',
                    readiness.incomplete > 0
                      ? t('count.notReadyIncomplete', { count: readiness.incomplete })
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' · '),
                ].join(' ')}
          </Text>
        </Group>
      )}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder={t('count.search')}
            aria-label={t('count.search')}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            w={{ base: '100%', sm: 240 }}
            radius="md"
          />
          <Select
            aria-label={t('count.filterLabel')}
            data={filters.map((value) => ({
              value,
              label: `${labelOf[value]} (${opname.lines.filter(MATCHERS[value]).length})`,
            }))}
            value={filter}
            onChange={(value) => setFilter((value as Filter | null) ?? 'all')}
            allowDeselect={false}
            radius="md"
            w={{ base: '100%', sm: 220 }}
          />
          <Text size="xs" c={saveState === 'failed' ? 'red.7' : 'dimmed'} aria-live="polite">
            {saveState === 'idle'
              ? ''
              : t(`count.${saveState === 'failed' ? 'saveFailed' : saveState}`)}
          </Text>
        </Group>
        {actions.fillCounts && (
          <FoundProductPicker
            taken={opname.lines.map((line) => line.productId)}
            saving={addingFound}
            onAdd={(product) => onSave({ product, countedQty: 0 })}
          />
        )}
      </Group>
      <DataTableFrame minWidth={showValues ? 1240 : 640} stickyFirst>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {columnHeader(t('count.product'))}
            {columnHeader(t('count.unit'))}
            {showValues && columnHeader(t('count.book'), 'right')}
            {columnHeader(t('count.counted'))}
            {showValues && columnHeader(t('count.diff'), 'right')}
            {showValues && columnHeader(t('count.unitCost'), 'right')}
            {showValues && columnHeader(t('count.value'), 'right')}
            {showValues && columnHeader(t('count.reason'))}
            {columnHeader(t('count.note'))}
            {columnHeader(t('count.recount'), 'center')}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={columns}>
                <Text size="sm" c="dimmed" ta="center" py="lg">
                  {t('count.empty')}
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            rows.map((line) => (
              <OpnameCountRow
                key={line.id}
                line={line}
                showValues={showValues}
                canCount={actions.fillCounts}
                canReason={actions.fillReasons}
                onSave={editable ? onSave : () => undefined}
              />
            ))
          )}
        </Table.Tbody>
      </DataTableFrame>
    </Stack>
  );
}
