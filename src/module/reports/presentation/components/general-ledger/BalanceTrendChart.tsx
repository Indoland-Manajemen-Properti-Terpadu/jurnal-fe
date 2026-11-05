import React from 'react';
import { Group, Text } from '@mantine/core';
import type { BalancePoint } from '@/module/reports/domain/generalLedgerInsights';
import { displayDate, formatMoney } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import classes from './GeneralLedger.module.css';

const WIDTH = 600;
const HEIGHT = 140;
const PAD = 10;

interface BalanceTrendChartProps {
  points: BalancePoint[];
}

/** Area chart of an account's running balance, drawn in SVG so it needs no chart library. */
export const BalanceTrendChart: React.FC<BalanceTrendChartProps> = ({ points }) => {
  const { t } = useTranslation('reports');
  const values = points.map((point) => point.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const xs = points.map((_, index) =>
    points.length === 1 ? WIDTH : (index / (points.length - 1)) * WIDTH
  );
  const ys = points.map(
    (point) => HEIGHT - PAD - ((point.balance - min) / span) * (HEIGHT - PAD * 2)
  );
  const line = points.length === 1 ? [0, WIDTH] : xs;
  const lineY = points.length === 1 ? [ys[0], ys[0]] : ys;
  const path = line
    .map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${lineY[i].toFixed(1)}`)
    .join(' ');
  const area = `${path} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`;
  const last = points.length - 1;

  return (
    <div>
      <Group gap="md" mb="xs" wrap="wrap">
        <Text fz="xs" c="dimmed">
          {t('generalLedger.chartHighest')}{' '}
          <Text span fw={600} c="dark.8">
            {formatMoney(max)}
          </Text>
        </Text>
        <Text fz="xs" c="dimmed">
          {t('generalLedger.chartLowest')}{' '}
          <Text span fw={600} c="dark.8">
            {formatMoney(min)}
          </Text>
        </Text>
      </Group>
      <div
        className={classes.chartFrame}
        role="img"
        aria-label={`${t('generalLedger.chartBalanceTitle')}: ${formatMoney(points[0].balance)} → ${formatMoney(points[last].balance)}`}
      >
        <svg
          className={classes.chartSvg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gl-balance-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--mantine-color-primary-6)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--mantine-color-primary-6)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={0}
              x2={WIDTH}
              y1={HEIGHT * ratio}
              y2={HEIGHT * ratio}
              stroke="var(--mantine-color-gray-2)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill="url(#gl-balance-fill)" />
          <path
            d={path}
            fill="none"
            stroke="var(--mantine-color-primary-6)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className={classes.endDot}
          style={{
            left: `${(points.length === 1 ? 100 : (xs[last] / WIDTH) * 100).toFixed(2)}%`,
            top: `${((ys[last] / HEIGHT) * 100).toFixed(2)}%`,
          }}
        />
      </div>

      <Group justify="space-between" mt={6} wrap="nowrap">
        <Text fz="xs" c="dimmed">
          {displayDate(points[0].date)}
        </Text>
        <Text fz="xs" c="dimmed">
          {displayDate(points[last].date)}
        </Text>
      </Group>
    </div>
  );
};
