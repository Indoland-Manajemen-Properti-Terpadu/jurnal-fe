import { Fragment } from 'react';
import { NumberInput, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  COIN_VALUES,
  countedTotal,
  MAX_PIECES,
  NOTE_VALUES,
  pieceSubtotal,
  type CountDraft,
} from '@/module/petty-cash/domain/cashCount';

interface Props {
  draft: CountDraft;
  errorFor: (path: string) => string | undefined;
  onChange: (draft: CountDraft) => void;
}

const money = (amount: number) => formatCurrency(amount, false);

/** Pieces per denomination with the subtotal of each row and the grand total, updated as you type. */
export function DenominationCalculator({ draft, errorFor, onChange }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');

  const setPieces = (group: 'notes' | 'coins', value: number, pieces: number | string) =>
    onChange({
      ...draft,
      [group]: { ...draft[group], [String(value)]: typeof pieces === 'number' ? pieces : '' },
    });

  const section = (group: 'notes' | 'coins', values: readonly number[]) => (
    <Fragment key={group}>
      <Table.Tr bg="gray.0">
        <Table.Td colSpan={3}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
            {t(group === 'notes' ? 'countForm.banknotes' : 'countForm.coins')}
          </Text>
        </Table.Td>
      </Table.Tr>
      {values.map((value) => {
        const pieces = draft[group][String(value)];
        const label = money(value);
        return (
          <Table.Tr key={`${group}-${value}`}>
            <Table.Td>
              <Text size="sm" fw={600}>
                {label}
              </Text>
            </Table.Td>
            <Table.Td w={140}>
              <NumberInput
                aria-label={t('countForm.piecesFor', { label })}
                placeholder="0"
                min={0}
                max={MAX_PIECES}
                decimalScale={0}
                allowNegative={false}
                hideControls
                size="sm"
                value={pieces}
                onChange={(next) => setPieces(group, value, next)}
                error={errorFor(`${group}.${value}`)}
              />
            </Table.Td>
            <Table.Td ta="right">
              <Text size="sm" c={pieceSubtotal(value, pieces) > 0 ? 'dark.9' : 'dimmed'}>
                {money(pieceSubtotal(value, pieces))}
              </Text>
            </Table.Td>
          </Table.Tr>
        );
      })}
    </Fragment>
  );

  return (
    <Table.ScrollContainer minWidth={360}>
      <Table verticalSpacing="xs" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('countForm.denomination')}</Table.Th>
            <Table.Th>{t('countForm.pieces')}</Table.Th>
            <Table.Th ta="right">{t('countForm.subtotal')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {section('notes', NOTE_VALUES)}
          {section('coins', COIN_VALUES)}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Text fw={700}>{t('countForm.counted')}</Text>
            </Table.Td>
            <Table.Td ta="right">
              <Text fw={700}>{money(countedTotal(draft))}</Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Table.ScrollContainer>
  );
}
