import React from 'react';

interface ReportMiniBarsProps {
  values: number[];
  /** Fill colour, a theme colour variable. */
  tone?: string;
  /** Text for assistive technology and the hover title. */
  label: string;
  width?: number;
  height?: number;
}

const MAX_BARS = 24;

/** A tiny column chart for a trend inside a card; the tallest value fills the height. */
export const ReportMiniBars: React.FC<ReportMiniBarsProps> = ({
  values,
  tone = 'var(--mantine-color-primary-6)',
  label,
  width = 120,
  height = 44,
}) => {
  const shown = values.slice(-MAX_BARS);
  const peak = Math.max(...shown, 0);

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 3,
        width,
        height,
        flexShrink: 0,
      }}
    >
      {shown.map((value, index) => (
        <span
          key={index}
          style={{
            flex: '1 1 0',
            maxWidth: 10,
            height: `${peak > 0 ? Math.max(8, (value / peak) * 100) : 8}%`,
            background: value > 0 ? tone : 'var(--mantine-color-gray-2)',
            borderRadius: 3,
            opacity: value > 0 ? 0.35 + 0.65 * (value / peak) : 1,
          }}
        />
      ))}
    </div>
  );
};
