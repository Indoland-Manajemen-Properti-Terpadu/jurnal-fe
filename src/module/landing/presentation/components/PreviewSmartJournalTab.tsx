import { Badge, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import type { DecimalPrecision } from './previewTypes';

interface PreviewSmartJournalTabProps {
  precision: DecimalPrecision;
  onPrecisionChange: (precision: DecimalPrecision) => void;
}

const TOTAL_AMOUNT = 125400000.0;

const PRECISION_OPTIONS: ReadonlyArray<{ value: DecimalPrecision; labelKey: string }> = [
  { value: 0, labelKey: 'preview.smartJournal.precision0' },
  { value: 2, labelKey: 'preview.smartJournal.precision2' },
  { value: 4, labelKey: 'preview.smartJournal.precision4' },
];

const GRID_ROW_STYLE = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 140px',
} as const;

export function PreviewSmartJournalTab({
  precision,
  onPrecisionChange,
}: PreviewSmartJournalTabProps) {
  const { t } = useTranslation('landing');

  const formatAmount = (val: number) =>
    val.toLocaleString('id-ID', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });

  return (
    <div className={classes.previewBody}>
      <div className={classes.smartJournalCard}>
        <div className={classes.smartJournalToolbar}>
          <div>
            <Text fw={750} fz="xs" c="dark.8">
              {t('preview.smartJournal.title')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('preview.smartJournal.subtitle')}
            </Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Text fz="var(--jurnal-text-xs)" fw={600} c="dimmed">
              {t('preview.smartJournal.precisionLabel')}
            </Text>
            <div className={classes.smartPrecisionToggle}>
              {PRECISION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${classes.precisionBtn} ${precision === option.value ? classes.precisionBtnActive : ''}`}
                  onClick={() => onPrecisionChange(option.value)}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            ...GRID_ROW_STYLE,
            padding: '10px 18px',
            background: 'var(--mantine-color-slate-0)',
            borderBottom: '1px solid var(--lp-line)',
            fontSize: 'var(--jurnal-text-xs)',
            fontWeight: 700,
            color: 'var(--mantine-color-slate-5)',
          }}
        >
          <span>{t('preview.smartJournal.colAccount')}</span>
          <span style={{ textAlign: 'right' }}>{t('preview.smartJournal.colDebit')}</span>
          <span style={{ textAlign: 'right' }}>{t('preview.smartJournal.colCredit')}</span>
          <span style={{ textAlign: 'center' }}>{t('preview.smartJournal.colIndicator')}</span>
        </div>

        <div className={`${classes.journalRow} ${classes.journalRowDebit}`}>
          <div>
            <Text fw={700} fz="xs">
              {t('preview.smartJournal.rows.bank.account')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('preview.smartJournal.rows.bank.note')}
            </Text>
          </div>
          <div className={classes.debitAmount}>Rp {formatAmount(81202756.245)}</div>
          <div style={{ textAlign: 'right', color: 'var(--mantine-color-slate-4)' }}>—</div>
          <div style={{ textAlign: 'center' }}>
            <Badge size="xs" color="teal" variant="light">
              {t('preview.smartJournal.rows.bank.badge')}
            </Badge>
          </div>
        </div>

        <div className={`${classes.journalRow} ${classes.journalRowDebit}`}>
          <div>
            <Text fw={700} fz="xs">
              {t('preview.smartJournal.rows.chemicals.account')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('preview.smartJournal.rows.chemicals.note')}
            </Text>
          </div>
          <div className={classes.debitAmount}>Rp {formatAmount(44197243.755)}</div>
          <div style={{ textAlign: 'right', color: 'var(--mantine-color-slate-4)' }}>—</div>
          <div style={{ textAlign: 'center' }}>
            <Badge size="xs" color="teal" variant="light">
              {t('preview.smartJournal.rows.chemicals.badge')}
            </Badge>
          </div>
        </div>

        <div className={`${classes.journalRow} ${classes.journalRowCredit}`}>
          <div>
            <Text fw={700} fz="xs">
              {t('preview.smartJournal.rows.payable.account')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('preview.smartJournal.rows.payable.note')}
            </Text>
          </div>
          <div style={{ textAlign: 'right', color: 'var(--mantine-color-slate-4)' }}>—</div>
          <div className={classes.creditAmount}>Rp {formatAmount(TOTAL_AMOUNT)}</div>
          <div style={{ textAlign: 'center' }}>
            <Badge size="xs" color="indigo" variant="light">
              {t('preview.smartJournal.rows.payable.badge')}
            </Badge>
          </div>
        </div>

        <div
          style={{
            ...GRID_ROW_STYLE,
            padding: '12px 18px',
            background: 'color-mix(in srgb, var(--mantine-color-primary-6) 5%, transparent)',
            fontSize: 'var(--jurnal-text-sm)',
            fontWeight: 800,
            color: 'var(--lp-navy)',
          }}
        >
          <span>{t('preview.smartJournal.totalLabel')}</span>
          <span style={{ textAlign: 'right', color: 'var(--mantine-color-emerald-7)' }}>
            Rp {formatAmount(TOTAL_AMOUNT)}
          </span>
          <span style={{ textAlign: 'right', color: 'var(--mantine-color-indigo-7)' }}>
            Rp {formatAmount(TOTAL_AMOUNT)}
          </span>
          <div style={{ textAlign: 'center' }}>
            <Badge size="sm" color="teal" variant="filled">
              {t('preview.smartJournal.balanced')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
