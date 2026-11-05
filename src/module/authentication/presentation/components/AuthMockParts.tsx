import React from 'react';
import { Box, Group, Text } from '@mantine/core';
import classes from './Auth.module.css';

export const BLUE = 'var(--mantine-color-primary-6)';
export const BLUE_SOFT = 'var(--mantine-color-primary-2)';
export const GREEN = 'var(--mantine-color-teal-6)';

/** A sample figure inside a mock card; the numbers are example data, not real figures. */
export const Money = ({ children, bold }: { children: React.ReactNode; bold?: boolean }) => (
  <Text fz="xs" fw={bold ? 700 : 500} className={classes.num}>
    {children}
  </Text>
);

export const Status = ({ label, tone }: { label: string; tone: string }) => (
  <Group gap={6} wrap="nowrap">
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone }} />
    <Text fz="xs" fw={600} c="dark.7">
      {label}
    </Text>
  </Group>
);

/** Small ring with its figure in the middle. */
export const Ring = ({
  value,
  label,
  tone = GREEN,
}: {
  value: number;
  label: string;
  tone?: string;
}) => {
  const size = 56;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  return (
    <Box pos="relative" w={size} h={size} style={{ flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={28}
            cy={28}
            r={radius}
            fill="none"
            stroke="var(--mantine-color-gray-2)"
            strokeWidth={6}
          />
          <circle
            cx={28}
            cy={28}
            r={radius}
            fill="none"
            stroke={tone}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          />
        </g>
      </svg>
      <Text
        fz={11}
        fw={700}
        style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
      >
        {label}
      </Text>
    </Box>
  );
};

/** A smooth area chart from a few points, drawn in SVG. */
export const Area = ({ points, height = 90 }: { points: number[]; height?: number }) => {
  const width = 360;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const x = (i: number) => (i / (points.length - 1)) * width;
  const y = (v: number) => height - 8 - ((v - min) / (max - min || 1)) * (height - 20);
  const line = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="auth-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity={0.28} />
          <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.33, 0.66].map((r) => (
        <line
          key={r}
          x1={0}
          x2={width}
          y1={height * r}
          y2={height * r}
          stroke="var(--mantine-color-gray-2)"
        />
      ))}
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill="url(#auth-area)" />
      <path
        d={line}
        fill="none"
        stroke={BLUE}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export const Frame = ({ children }: { children: React.ReactNode }) => (
  <Box pos="relative" w={640} h={520}>
    <div className={classes.glow} aria-hidden="true" />
    {children}
  </Box>
);
