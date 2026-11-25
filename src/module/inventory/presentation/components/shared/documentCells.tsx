import { ActionIcon, Anchor, Text, Tooltip } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import { Link, generatePath, useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  documentTarget,
  hasCostBreakdown,
  type CostBreakdown,
} from '@/module/inventory/domain/stockMovement';
import {
  stockTakeDetailPath,
  transferDetailPath,
} from '@/module/inventory/presentation/components/shared/stockLinks';
import { backStateOf } from '@/router/backState';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';

/**
 * The page of a document a movement came from; null for a source that has no page here, so its
 * number is plain text rather than a link that leads nowhere.
 */
const documentPath = (sourceType: string, sourceId: string): string | null => {
  const target = documentTarget(sourceType, sourceId);
  if (!target) return null;
  if (target.kind === 'purchaseReceipt') {
    return generatePath(routes.purchases.receiptDetail, { id: target.id });
  }
  if (target.kind === 'transfer') return transferDetailPath(target.id);
  return stockTakeDetailPath(target.id);
};

type DocumentProps = {
  sourceType: string;
  sourceId: string;
  number: string;
};

export function DocumentNumber({ sourceType, sourceId, number }: Readonly<DocumentProps>) {
  const { t } = useTranslation('stockMovements');
  const location = useLocation();
  const path = documentPath(sourceType, sourceId);
  if (!number) {
    return (
      <Text size="sm" c="dimmed">
        -
      </Text>
    );
  }
  return path ? (
    <Anchor
      component={Link}
      to={path}
      // The document page leads back here, with the filters this page had, not to its own list.
      state={backStateOf(`${location.pathname}${location.search}`, t('history.backToMovements'))}
      size="sm"
      fw={500}
    >
      {number}
    </Anchor>
  ) : (
    <Text size="sm" fw={500}>
      {number}
    </Text>
  );
}

/** The journal a movement posted, or a plain note that it posted none. */
export function JournalLink({ journalId }: Readonly<{ journalId: string | null }>) {
  const { t } = useTranslation('stockMovements');
  if (!journalId) {
    return (
      <Tooltip label={t('history.noJournalHint')} multiline w={240} withArrow>
        <Text size="sm" c="dimmed" span aria-label={t('history.noJournal')}>
          —
        </Text>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={t('history.viewJournal')} withArrow>
      <ActionIcon
        component={Link}
        to={generatePath(routes.journalEntries.detail, { idTransaction: journalId })}
        variant="light"
        color="primary"
        size="md"
        radius="md"
        aria-label={t('history.viewJournal')}
      >
        <IconFileText size={16} />
      </ActionIcon>
    </Tooltip>
  );
}

/** A unit price; when freight or tax is part of it, hovering explains what it is made of. */
export function UnitCost({
  amount,
  breakdown,
}: Readonly<{ amount: number | null; breakdown: CostBreakdown | null }>) {
  const { t } = useTranslation('stockMovements');
  if (amount === null) return <Text size="sm">-</Text>;
  if (!hasCostBreakdown(breakdown)) return <Text size="sm">{formatCurrency(amount)}</Text>;

  const parts = [t('history.costDpp', { amount: formatCurrency(breakdown.dpp) })];
  if (breakdown.vat > 0) {
    parts.push(t('history.costVat', { amount: formatCurrency(breakdown.vat) }));
  }
  if (breakdown.freight > 0) {
    parts.push(t('history.costFreight', { amount: formatCurrency(breakdown.freight) }));
  }
  return (
    <Tooltip label={parts.join(' + ')} withArrow>
      <Text size="sm" td="underline" style={{ textDecorationStyle: 'dotted', cursor: 'help' }}>
        {formatCurrency(amount)}
      </Text>
    </Tooltip>
  );
}

/** The type of a movement in the active language; the service's own label when it is not translated. */
export const useMovementTypeLabel = () => {
  const { t } = useTranslation('stockMovements');
  return (type: string, fallback: string) => {
    const key = `types.${type}`;
    const label = t(key);
    return label === `stockMovements.${key}` ? fallback : label;
  };
};
