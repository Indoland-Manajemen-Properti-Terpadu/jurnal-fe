import React from 'react';
import { Text } from '@mantine/core';

interface ReportRingProps {
  /** 0 to 100 */
  value: number;
  label: string;
  size?: number;
  /** Colour of the filled arc, a theme colour variable. */
  tone?: string;
}

const STROKE = 6;

/** A small progress ring with its figure in the middle. */
export const ReportRing: React.FC<ReportRingProps> = ({
  value,
  label,
  size = 64,
  tone = 'var(--mantine-color-primary-6)',
}) => {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--mantine-color-gray-2)"
          strokeWidth={STROKE}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Text
        fz="xs"
        fw={700}
        c="dark.9"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {label}
      </Text>
    </div>
  );
};
