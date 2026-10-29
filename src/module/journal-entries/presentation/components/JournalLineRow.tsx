import React from 'react';
import { ActionIcon, Grid, NumberInput, Select, TextInput, Tooltip } from '@mantine/core';
import { IconChevronDown, IconTrash } from '@tabler/icons-react';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';
import type { DraftLine } from '../../domain/journalEntry';
import type { DraftField } from '../store/useTransactionStore';

export interface AccountOption {
  value: string;
  label: string;
}

interface JournalLineRowProps {
  item: DraftLine;
  index: number;
  rowCount: number;
  minimumTransaction: number;
  accountOptions: AccountOption[];
  updateTransaction: (index: number, field: DraftField, value: string | number) => void;
  removeTransaction: (index: number) => void;
}

/**
 * One sortable row of the journal form. I2: a row holds one side only, so the input of the
 * opposite side is disabled while one side has an amount.
 */
const JournalLineRow = ({
  item,
  index,
  rowCount,
  minimumTransaction,
  accountOptions,
  updateTransaction,
  removeTransaction,
}: JournalLineRowProps) => {
  const { t } = useTranslation('journalEntries');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative' as const,
    boxShadow: isDragging ? '0 6px 16px rgba(0,0,0,0.12)' : 'none',
    opacity: isDragging ? 0.9 : 1,
  };

  const isDebitFilled = item.debit > 0;
  const isCreditFilled = item.credit > 0;

  const amountInput = (side: 'debit' | 'credit') => {
    const filled = side === 'debit' ? isDebitFilled : isCreditFilled;
    const otherFilled = side === 'debit' ? isCreditFilled : isDebitFilled;
    const color = side === 'debit' ? 'teal' : 'red';
    return (
      <NumberInput
        key={side}
        hideControls
        placeholder="0"
        prefix="Rp "
        thousandSeparator="."
        decimalSeparator=","
        min={0}
        value={item[side] === 0 ? '' : item[side]}
        onChange={(value) => updateTransaction(index, side, value)}
        disabled={otherFilled}
        styles={{
          input: {
            height: 38,
            fontSize: 13,
            fontWeight: filled ? 600 : 400,
            color: filled ? `var(--mantine-color-${color}-8)` : undefined,
            backgroundColor: otherFilled ? 'var(--mantine-color-gray-1)' : 'white',
            textAlign: 'right',
          },
        }}
      />
    );
  };

  return (
    <Grid
      ref={setNodeRef}
      columns={24}
      bg="white"
      gutter="sm"
      align="center"
      px="xs"
      py="xs"
      style={{
        ...style,
        borderRadius: 8,
        border: `1px solid ${isDragging ? themeColors.primary[5] : themeColors.slate[2]}`,
        backgroundColor: isDragging ? 'var(--mantine-color-primary-0)' : 'white',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <Grid.Col span={1} ta="center">
        <Tooltip label={t('editor.dragTooltip')} position="top">
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={t('editor.dragLabel')}
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab' }}
          >
            <DotsSixVerticalIcon size={20} color={themeColors.slate[5]} weight="bold" />
          </ActionIcon>
        </Tooltip>
      </Grid.Col>

      <Grid.Col span={7}>
        <Select
          key="accounts"
          placeholder={t('editor.accountPlaceholder')}
          data={accountOptions}
          value={item.account}
          searchable
          clearable
          onChange={(value) => updateTransaction(index, 'account', value || '')}
          rightSection={<IconChevronDown size={14} />}
          comboboxProps={{ width: 450, position: 'bottom-start' }}
          styles={{ input: { height: 38, fontSize: 13 } }}
        />
      </Grid.Col>

      <Grid.Col span={7}>
        <TextInput
          placeholder={t('editor.descriptionPlaceholder')}
          value={item.description}
          onChange={(e) => updateTransaction(index, 'description', e.target.value)}
          styles={{ input: { height: 38, fontSize: 13 } }}
        />
      </Grid.Col>

      <Grid.Col span={4}>{amountInput('debit')}</Grid.Col>
      <Grid.Col span={4}>{amountInput('credit')}</Grid.Col>

      <Grid.Col span={1} ta="center">
        <Tooltip label={t('editor.removeTooltip')}>
          <ActionIcon
            disabled={rowCount <= minimumTransaction}
            variant="subtle"
            color="red"
            onClick={() => removeTransaction(index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Grid.Col>
    </Grid>
  );
};

export default JournalLineRow;
