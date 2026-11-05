import { Button, Paper, Skeleton, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ReceivablesSummary, SaleDisplayCode } from '@/module/sales/domain/sale';
import {
  formatCompactIDR,
  formatCount,
  formatDate,
  formatIDR,
} from '@/module/sales/domain/saleFormat';
import type { DateRange } from '@/module/sales/domain/saleListState';
import {
  buildReceivablesView,
  type ReceivablePart,
  type ReceivablePartKey,
} from '@/module/sales/domain/saleReceivables';
import { SegmentBar } from '../shared/SegmentBar';
import classes from './ReceivablesPanel.module.css';

interface ReceivablesPanelProps {
  summary?: ReceivablesSummary;
  isLoading: boolean;
  range: DateRange;
  /** Opens the sent invoices in one payment state. */
  onShowStatus: (status: SaleDisplayCode) => void;
}

// Validated as a set (lightness, chroma, colour-blind separation): blue for money that came in, the
// brand's light blue for money not due yet, red only for money that is late.
const PART_COLOR: Record<ReceivablePartKey, string> = {
  received: 'var(--mantine-color-blue-7)',
  notDue: 'var(--mantine-color-secondary-6)',
  overdue: 'var(--mantine-color-red-5)',
};

const PART_STATUS: Record<ReceivablePartKey, SaleDisplayCode> = {
  received: 'PAID',
  notDue: 'UNPAID',
  overdue: 'OVERDUE',
};

/** Sales split into received, not yet due and overdue; every amount shown once. */
export function ReceivablesPanel({
  summary,
  isLoading,
  range,
  onShowStatus,
}: Readonly<ReceivablesPanelProps>) {
  const { t } = useTranslation('sales');

  if (isLoading) return <Skeleton height={176} radius="lg" />;
  if (!summary) return null;

  const view = buildReceivablesView(summary, Date.now());
  const period =
    range[0] && range[1]
      ? `${formatDate(range[0])} – ${formatDate(range[1])}`
      : t('stats.periodAll');

  const meta = (part: ReceivablePart): string =>
    [
      part.shareLabel === null ? null : t('stats.share', { percent: part.shareLabel }),
      part.count === null ? null : t('stats.invoices', { count: formatCount(part.count) }),
      part.key === 'overdue' && view.oldestOverdueDays !== null
        ? t('stats.oldest', { days: formatCount(view.oldestOverdueDays) })
        : null,
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} bg="white">
      <Text fw={700}>{t('stats.title')}</Text>
      <Text fz="var(--jurnal-text-xs)" c="dimmed" mb="lg">
        {t('stats.caption', { period })}
      </Text>

      <div className={classes.panel}>
        <div className={classes.hero}>
          <Text fz="var(--jurnal-text-sm)" c="dimmed" fw={500}>
            {t('stats.outstanding')}
          </Text>
          <Text
            className={classes.heroValue}
            fz="var(--jurnal-text-3xl)"
            c="dark.9"
            title={formatIDR(view.outstandingAmount)}
          >
            {formatCompactIDR(view.outstandingAmount)}
          </Text>
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('stats.ofBilled', { amount: formatCompactIDR(view.billedAmount) })}
          </Text>
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('stats.openInvoices', { count: formatCount(view.outstandingCount) })}
          </Text>
        </div>

        <div className={classes.breakdown}>
          {view.isEmpty ? (
            <Text size="sm" c="dimmed">
              {t('stats.empty')}
            </Text>
          ) : (
            <>
              <SegmentBar
                trackColor="var(--mantine-color-gray-2)"
                aria-label={`${t('stats.barAria')}: ${view.parts
                  .map((part) => `${t(`stats.parts.${part.key}`)} ${formatIDR(part.amount)}`)
                  .join(', ')}`}
                segments={view.parts.map((part) => ({
                  key: part.key,
                  label: t(`stats.parts.${part.key}`),
                  value: part.amount,
                  color: PART_COLOR[part.key],
                  tooltip: `${t(`stats.parts.${part.key}`)} · ${formatIDR(part.amount)}${
                    part.shareLabel === null ? '' : ` · ${part.shareLabel}%`
                  }`,
                }))}
              />
              <div className={classes.parts}>
                {view.parts.map((part) => (
                  <div key={part.key} className={classes.part}>
                    <span className={classes.name}>
                      <span className={classes.dot} style={{ background: PART_COLOR[part.key] }} />
                      <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={500}>
                        {t(`stats.parts.${part.key}`)}
                      </Text>
                    </span>
                    <Text
                      className={classes.amount}
                      fz="var(--jurnal-text-xl)"
                      c={part.key === 'overdue' && part.amount > 0 ? 'red.7' : 'dark.9'}
                      title={formatIDR(part.amount)}
                    >
                      {formatCompactIDR(part.amount)}
                    </Text>
                    <Text fz="var(--jurnal-text-xs)" c="dimmed">
                      {meta(part)}
                    </Text>
                    {part.amount > 0 && (
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        px={0}
                        mt={4}
                        rightSection={<IconArrowRight size={13} />}
                        onClick={() => onShowStatus(PART_STATUS[part.key])}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        {t(`stats.view.${part.key}`)}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Paper>
  );
}
