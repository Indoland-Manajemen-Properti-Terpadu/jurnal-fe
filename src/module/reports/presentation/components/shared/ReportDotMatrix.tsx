import React from 'react';

interface ReportDotMatrixProps {
  /** Dots that are filled. */
  active: number;
  /** All dots. */
  total: number;
  label: string;
  columns?: number;
}

/** One dot per item, filled when it counts (an account with movement), in rows of `columns`. */
export const ReportDotMatrix: React.FC<ReportDotMatrixProps> = ({
  active,
  total,
  label,
  columns = 5,
}) => (
  <div
    role="img"
    aria-label={label}
    title={label}
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 10px)`,
      gap: 5,
      flexShrink: 0,
    }}
  >
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background:
            index < active ? 'var(--mantine-color-primary-6)' : 'var(--mantine-color-gray-2)',
        }}
      />
    ))}
  </div>
);
