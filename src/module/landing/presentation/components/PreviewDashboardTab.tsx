import { Badge, Group, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';

const KPI_CARDS = [
  { id: 'cash', value: 'Rp 4.821.500.000', highlight: true },
  { id: 'revenue', value: 'Rp 1.642.800.000', highlight: false },
  { id: 'profit', value: 'Rp 584.250.000', highlight: false },
] as const;

const LEDGER_ENTRIES = [
  { id: 'rent', ref: '#JU-2026-0812', amount: '45.000.000' },
  { id: 'penalty', ref: '#JU-2026-0811', amount: '3.500.000' },
  { id: 'vendor', ref: '#JU-2026-0810', amount: '18.250.000' },
] as const;

export function PreviewDashboardTab() {
  const { t } = useTranslation('landing');

  return (
    <div className={classes.previewBody}>
      <div className={classes.previewKpiGrid}>
        {KPI_CARDS.map((card) => (
          <div
            key={card.id}
            className={
              card.highlight
                ? `${classes.previewKpiCard} ${classes.previewKpiCardHighlight}`
                : classes.previewKpiCard
            }
          >
            <div className={classes.previewKpiLabel}>{t(`preview.dashboard.${card.id}.label`)}</div>
            <div className={classes.previewKpiValue}>{card.value}</div>
            <div className={`${classes.previewKpiTrend} ${classes.debitAmount}`}>
              {t(`preview.dashboard.${card.id}.trend`)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid var(--lp-line)', borderRadius: 10, padding: 18 }}>
        <Group justify="space-between" mb="xs">
          <Text fw={700} fz="sm">
            {t('preview.dashboard.ledgerTitle')}
          </Text>
          <Badge variant="outline" color="blue" size="xs">
            {t('preview.dashboard.autoPosted')}
          </Badge>
        </Group>
        <div style={{ display: 'grid', gap: 8, fontSize: 'var(--jurnal-text-sm)' }}>
          {LEDGER_ENTRIES.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--mantine-color-slate-0)',
                borderRadius: 6,
              }}
            >
              <span>
                <strong>{entry.ref}</strong> {t(`preview.dashboard.entries.${entry.id}`)}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--mantine-color-emerald-7)' }}>
                {t('preview.dashboard.balancedAmount', { amount: entry.amount })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
