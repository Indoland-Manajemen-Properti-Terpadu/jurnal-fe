import React from 'react';
import { Text } from '@mantine/core';

export interface DonutSegment {
  value: number;
  /** Fill colour, a theme colour variable. */
  tone: string;
}

interface ReportDonutProps {
  segments: DonutSegment[];
  /** Figure in the middle, for example a percentage. */
  label?: string;
  /** Text for assistive technology and the hover title. */
  description: string;
  size?: number;
}

const STROKE = 8;

/** A donut of one or more segments on a gray track; an empty set of segments leaves only the track. */
export const ReportDonut: React.FC<ReportDonutProps> = ({
  segments,
  label,
  description,
  size = 72,
}) => {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  let consumed = 0;

  return (
    <div
      role="img"
      aria-label={description}
      title={description}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--mantine-color-gray-2)"
            strokeWidth={STROKE}
          />
          {total > 0 &&
            segments.map((segment, index) => {
              const length = (Math.max(0, segment.value) / total) * circumference;
              const offset = -consumed;
              consumed += length;
              return length > 0 ? (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.tone}
                  strokeWidth={STROKE}
                  strokeDasharray={`${Math.max(0, length - 1.5)} ${circumference}`}
                  strokeDashoffset={offset}
                />
              ) : null;
            })}
        </g>
      </svg>
      {label && (
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
      )}
    </div>
  );
};
