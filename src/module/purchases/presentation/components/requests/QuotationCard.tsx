import { ActionIcon, Badge, Button, Table, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconBuildingStore, IconCheck, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseRequest, Quotation } from '@/module/purchases/domain/purchaseDocuments';
import classes from '@/module/purchases/presentation/components/requests/QuotationCard.module.css';
import {
  formatAmount,
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

const numeric = { whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } as const;

interface QuotationCardProps {
  quotation: Quotation;
  request: PurchaseRequest;
  chosen: boolean;
  isLowest: boolean;
  /** Total of the cheapest quotation, to show how far this one is above it. */
  lowestTotal: number;
  expired: boolean;
  mayEdit: boolean;
  canChoose: boolean;
  canRemove: boolean;
  busy: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onChoose: () => void;
}

/** One vendor's offer: who and how much, what is quoted line by line, and what can be done with it. */
export const QuotationCard = ({
  quotation,
  request,
  chosen,
  isLowest,
  lowestTotal,
  expired,
  mayEdit,
  canChoose,
  canRemove,
  busy,
  onEdit,
  onRemove,
  onChoose,
}: Readonly<QuotationCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const meta = [
    quotation.number,
    formatDay(quotation.date, currentLanguage),
    quotation.validUntil
      ? t('requests.quotation.validUntilShort', {
          date: formatDay(quotation.validUntil, currentLanguage),
        })
      : '',
  ].filter(Boolean);
  const above = quotation.total - lowestTotal;
  const showFoot = Boolean(quotation.notes) || mayEdit || canChoose;

  return (
    <div className={classes.card} data-chosen={chosen}>
      <div className={classes.head}>
        <div className={classes.vendor}>
          <ThemeIcon variant="light" color="primary" size={36} radius="md">
            <IconBuildingStore size={18} stroke={1.8} />
          </ThemeIcon>
          <div style={{ minWidth: 0 }}>
            <Text fz="md" fw={700} lh={1.3} truncate>
              {quotation.vendor.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {meta.join(' · ')}
            </Text>
          </div>
        </div>
        <div className={classes.total}>
          <Text fz="xs" c="dimmed" fw={500}>
            {t('requests.quotation.total')}
          </Text>
          <Text className={classes.amount} fz="xl" fw={700} lh={1.2}>
            {formatAmount(quotation.total)}
          </Text>
          {!isLowest && above > 0 && (
            <Text fz="xs" c="dimmed">
              {t('requests.quotation.aboveLowest', { amount: formatAmount(above) })}
            </Text>
          )}
        </div>
      </div>

      {(chosen || isLowest || expired) && (
        <div style={{ display: 'flex', gap: 6, padding: '0 var(--mantine-spacing-lg) 12px' }}>
          {chosen && (
            <Badge color="primary" variant="filled" radius="sm">
              {t('requests.quotation.chosen')}
            </Badge>
          )}
          {isLowest && (
            <Badge color="primary" variant="light" radius="sm">
              {t('requests.quotation.lowest')}
            </Badge>
          )}
          {expired && (
            <Badge color="yellow" variant="light" radius="sm">
              {t('requests.quotation.expired')}
            </Badge>
          )}
        </div>
      )}

      <div className={classes.table}>
        <Table verticalSpacing="sm" horizontalSpacing="lg">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {['item', 'quantity', 'unitPrice', 'amount'].map((key) => (
                <Table.Th key={key} ta={key === 'item' ? undefined : 'right'}>
                  <Text fz="xs" fw={700} c="dimmed" tt="uppercase" style={{ whiteSpace: 'nowrap' }}>
                    {t(`requests.quotation.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {quotation.items.map((line) => {
              const item = request.items.find((candidate) => candidate.id === line.requestItemId);
              return (
                <Table.Tr key={line.requestItemId}>
                  <Table.Td>
                    <Text fz="sm" fw={500}>
                      {item?.product?.name ?? (item?.description || '-')}
                    </Text>
                    {item?.product && item.description && (
                      <Text fz="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right" style={numeric}>
                    <Text fz="sm">{formatQuantity(line.quantity)}</Text>
                  </Table.Td>
                  <Table.Td ta="right" style={numeric}>
                    <Text fz="sm">{formatAmount(line.unitPrice)}</Text>
                  </Table.Td>
                  <Table.Td ta="right" style={numeric}>
                    <Text fz="sm" fw={500}>
                      {formatAmount(line.quantity * line.unitPrice)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>

      {showFoot && (
        <div className={classes.foot}>
          <div className={classes.notes}>
            {quotation.notes && (
              <Text fz="xs" c="dimmed">
                <Text span fz="xs" fw={600} c="dark.7">
                  {t('requests.quotation.notes')}:{' '}
                </Text>
                {quotation.notes}
              </Text>
            )}
          </div>
          <div className={classes.actions}>
            {mayEdit && (
              <>
                <Tooltip label={t('common.edit')}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={t('requests.quotation.editAria', { vendor: quotation.vendor.name })}
                    onClick={onEdit}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  label={
                    canRemove ? t('requests.quotation.remove') : t('requests.quotation.keepOne')
                  }
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={t('requests.quotation.removeAria', {
                      vendor: quotation.vendor.name,
                    })}
                    disabled={!canRemove || busy}
                    onClick={onRemove}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
            {canChoose && (
              <Button
                size="sm"
                variant="light"
                leftSection={<IconCheck size={14} />}
                loading={busy}
                onClick={onChoose}
              >
                {t('requests.quotation.choose')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
