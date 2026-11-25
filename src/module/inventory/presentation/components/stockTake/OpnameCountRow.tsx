import { useEffect, useState } from 'react';
import {
  Checkbox,
  Group,
  NumberInput,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconCircleDashed } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  lineState,
  reasonsForDiff,
  type LineState,
  type OpnameLine,
  type OpnameLineChange,
  type OpnameReason,
} from '@/module/inventory/domain/stockOpname';
import { Dash } from '@/module/inventory/presentation/components/shared/DetailFrame';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

type Props = {
  line: OpnameLine;
  /** False for a person who counts blind: book balance, difference and values are not drawn. */
  showValues: boolean;
  canCount: boolean;
  canReason: boolean;
  onSave: (change: OpnameLineChange) => void;
};

const toNumber = (value: number | string): number | null =>
  value === '' || Number.isNaN(Number(value)) ? null : Number(value);

const NEEDS_WORK: LineState[] = ['reasonRequired', 'noteRequired', 'costRequired'];

/** The line under the product name that says where it stands, in words and a small icon. */
const StateLine = ({ state, found }: Readonly<{ state: LineState; found: boolean }>) => {
  const { t } = useTranslation('stockTake');
  const needsWork = NEEDS_WORK.includes(state);
  const done = state === 'match' || state === 'complete' || state === 'counted';
  const color = needsWork ? 'orange.8' : done ? 'green.8' : 'dimmed';
  const StateIcon = needsWork ? IconAlertCircle : done ? IconCircleCheck : IconCircleDashed;
  return (
    <Group gap={4} wrap="nowrap" mt={2}>
      <StateIcon size={13} color={`var(--mantine-color-${color.replace('.', '-')})`} />
      <Text size="xs" c={color} style={{ whiteSpace: 'nowrap' }}>
        {t(`count.status.${state}`)}
        {found ? ` · ${t('count.status.found')}` : ''}
      </Text>
    </Group>
  );
};

/** One product of the count; every field saves by itself as soon as it is left. */
export function OpnameCountRow({ line, showValues, canCount, canReason, onSave }: Readonly<Props>) {
  const { t } = useTranslation('stockTake');
  const [counted, setCounted] = useState<number | string>(line.countedQty ?? '');
  const [note, setNote] = useState(line.note);
  const [cost, setCost] = useState<number | string>(line.unitCost ?? '');

  useEffect(() => setCounted(line.countedQty ?? ''), [line.countedQty]);
  useEffect(() => setNote(line.note), [line.note]);
  useEffect(() => setCost(line.unitCost ?? ''), [line.unitCost]);

  const state = lineState(line, showValues);
  const reasons: OpnameReason[] =
    line.allowedReasons.length > 0 ? line.allowedReasons : reasonsForDiff(line.diffQty);
  const diff = line.diffQty;
  const costInput = showValues && line.costEditable && (diff ?? 0) > 0 && canReason;

  const saveCounted = () => {
    const typed = toNumber(counted);
    // A count is never below zero: what the field shows after leaving it is what is sent.
    const next = typed === null ? null : Math.max(0, typed);
    if (next !== null && next !== typed) setCounted(next);
    if (next !== null && next !== line.countedQty) {
      onSave({ product: line.productId, countedQty: next });
    }
  };
  const saveNote = () => {
    if (note.trim() !== line.note.trim()) onSave({ product: line.productId, note });
  };
  const saveCost = () => {
    const next = toNumber(cost);
    if (next !== null && next !== line.unitCost) {
      onSave({ product: line.productId, unitCost: next });
    }
  };

  return (
    <Table.Tr>
      <Table.Td miw={220}>
        <Text size="sm" fw={600} c="dark.8">
          {line.name}
        </Text>
        {line.sku && (
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            {line.sku}
          </Text>
        )}
        <StateLine state={state} found={line.isFound} />
      </Table.Td>
      <Table.Td>
        <Text size="sm">{line.unit || '-'}</Text>
      </Table.Td>
      {showValues && (
        <Table.Td ta="right">
          {line.bookQty === null ? <Dash /> : <Text size="sm">{numberFormat(line.bookQty)}</Text>}
        </Table.Td>
      )}
      <Table.Td>
        <NumberInput
          aria-label={`${t('count.counted')} ${line.name}`}
          value={counted}
          onChange={setCounted}
          onBlur={saveCounted}
          disabled={!canCount}
          min={0}
          allowNegative={false}
          decimalScale={2}
          hideControls
          radius="md"
          size="xs"
          w={100}
          styles={{ input: { textAlign: 'right' } }}
        />
      </Table.Td>
      {showValues && (
        <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
          {diff === null || diff === 0 ? (
            <Dash />
          ) : (
            <Text size="sm" fw={700} c={diff < 0 ? 'red.7' : 'green.8'}>
              {diff > 0 ? '+' : ''}
              {numberFormat(diff)}
            </Text>
          )}
        </Table.Td>
      )}
      {showValues && (
        <Table.Td ta="right">
          {costInput ? (
            <NumberInput
              aria-label={`${t('count.unitCost')} ${line.name}`}
              value={cost}
              onChange={setCost}
              onBlur={saveCost}
              min={0}
              hideControls
              radius="md"
              size="xs"
              w={130}
              prefix="Rp "
              thousandSeparator="."
              decimalSeparator=","
              error={state === 'costRequired'}
            />
          ) : (
            <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
              {line.unitCost === null ? '-' : formatCurrency(line.unitCost)}
            </Text>
          )}
        </Table.Td>
      )}
      {showValues && (
        <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
          {line.diffValue === null || line.diffValue === 0 ? (
            <Dash />
          ) : (
            <Text size="sm" fw={600} c={line.diffValue < 0 ? 'red.7' : 'green.8'}>
              {formatCurrency(line.diffValue)}
            </Text>
          )}
        </Table.Td>
      )}
      {showValues && (
        <Table.Td>
          {reasons.length > 0 ? (
            <Select
              aria-label={`${t('count.reason')} ${line.name}`}
              placeholder={t('count.pickReason')}
              data={reasons.map((value) => ({ value, label: t(`reason.${value}`) }))}
              value={line.reason}
              onChange={(value) =>
                onSave({ product: line.productId, reason: (value as OpnameReason | null) ?? null })
              }
              disabled={!canReason}
              error={state === 'reasonRequired'}
              radius="md"
              size="xs"
              w={150}
              clearable
              comboboxProps={{ withinPortal: true }}
            />
          ) : (
            <Dash />
          )}
        </Table.Td>
      )}
      <Table.Td>
        <TextInput
          aria-label={`${t('count.note')} ${line.name}`}
          placeholder={t('count.notePlaceholder')}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
          onBlur={saveNote}
          disabled={!canCount && !canReason}
          error={state === 'noteRequired'}
          radius="md"
          size="xs"
          w={170}
        />
      </Table.Td>
      <Table.Td ta="center">
        <Tooltip label={t('count.recountMark')} withArrow>
          <Checkbox
            aria-label={`${t('count.recountMark')} ${line.name}`}
            checked={line.needsRecount}
            disabled={!canCount && !canReason}
            onChange={(event) =>
              onSave({ product: line.productId, needsRecount: event.currentTarget.checked })
            }
            styles={{ body: { justifyContent: 'center' } }}
          />
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
}
