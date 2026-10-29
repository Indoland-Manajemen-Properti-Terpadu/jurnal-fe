import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';

const TRUST_METRICS = [
  { id: 'throughput', value: '10.000+' },
  { id: 'discrepancy', value: '99.4%' },
  { id: 'closing', value: '4x' },
  { id: 'compliance', value: '100%' },
] as const;

export function TrustMetricsBar() {
  const { t } = useTranslation('landing');

  return (
    <div className={classes.trustBar}>
      <div className={classes.trustMetricsGrid}>
        {TRUST_METRICS.map((metric) => (
          <div key={metric.id} className={classes.trustMetricItem}>
            <div className={classes.trustMetricValue}>{metric.value}</div>
            <div className={classes.trustMetricLabel}>{t(`trust.${metric.id}.label`)}</div>
            <div className={classes.trustMetricSub}>{t(`trust.${metric.id}.sub`)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
