import React from 'react';
import classes from './Auth.module.css';

const c = (scale: string, step: number) => `var(--mantine-color-${scale}-${step})`;

interface PillProps {
  /** Unique prefix for the gradient ids (several scenes are in the page at once). */
  id: string;
  left: [string, string];
  right: [string, string];
}

/** The rounded backdrop of a scene: two tinted halves that meet in the middle. */
export const Pill: React.FC<PillProps> = ({ id, left, right }) => (
  <svg
    width={640}
    height={400}
    viewBox="0 0 640 400"
    aria-hidden="true"
    style={{ position: 'absolute', top: 60, left: 0 }}
  >
    <defs>
      <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={left[0]} />
        <stop offset="100%" stopColor={left[1]} />
      </linearGradient>
      <linearGradient id={`${id}-r`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={right[0]} />
        <stop offset="100%" stopColor={right[1]} />
      </linearGradient>
      <clipPath id={`${id}-clip`}>
        <rect width={640} height={400} rx={200} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id}-clip)`}>
      <rect width={320} height={400} fill={`url(#${id}-l)`} />
      <rect x={320} width={320} height={400} fill={`url(#${id}-r)`} />
      <ellipse
        cx={320}
        cy={392}
        rx={300}
        ry={26}
        fill="color-mix(in srgb, var(--mantine-color-black) 8%, transparent)"
      />
    </g>
  </svg>
);

/** A block of flats, with some windows lit. */
export const Building: React.FC<{ width?: number }> = ({ width = 150 }) => {
  const lit = new Set([1, 4, 6, 8, 11, 13, 14, 17, 19]);
  return (
    <svg width={width} height={(width * 270) / 160} viewBox="0 0 160 270" aria-hidden="true">
      <rect x={0} y={90} width={46} height={170} rx={8} fill={c('primary', 4)} />
      <rect x={34} y={10} width={116} height={250} rx={12} fill={c('primary', 7)} />
      <rect x={34} y={10} width={116} height={22} rx={12} fill={c('primary', 8)} />
      {Array.from({ length: 20 }, (_, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return (
          <rect
            key={index}
            x={50 + col * 26}
            y={46 + row * 34}
            width={16}
            height={22}
            rx={4}
            fill={lit.has(index) ? c('yellow', 3) : c('primary', 5)}
          />
        );
      })}
      <rect x={72} y={222} width={32} height={38} rx={6} fill={c('primary', 9)} />
      {[0, 1, 2].map((row) => (
        <rect
          key={row}
          x={8}
          y={104 + row * 30}
          width={12}
          height={18}
          rx={3}
          fill={c('primary', 6)}
        />
      ))}
    </svg>
  );
};

/** Three binders stacked: the books of the company. */
export const Binders: React.FC<{ width?: number }> = ({ width = 230 }) => {
  const rows = [
    { y: 104, w: 220, fill: c('primary', 7) },
    { y: 58, w: 204, fill: c('primary', 5) },
    { y: 12, w: 188, fill: c('sky', 5) },
  ];
  return (
    <svg width={width} height={(width * 160) / 230} viewBox="0 0 230 160" aria-hidden="true">
      {rows.map((row) => (
        <g key={row.y}>
          <rect x={0} y={row.y} width={row.w} height={40} rx={9} fill={row.fill} />
          <rect
            x={row.w - 74}
            y={row.y + 10}
            width={56}
            height={20}
            rx={5}
            fill="color-mix(in srgb, var(--mantine-color-white) 85%, transparent)"
          />
          <circle
            cx={22}
            cy={row.y + 20}
            r={8}
            fill="color-mix(in srgb, var(--mantine-color-black) 25%, transparent)"
          />
          <circle
            cx={22}
            cy={row.y + 20}
            r={4}
            fill="color-mix(in srgb, var(--mantine-color-white) 70%, transparent)"
          />
        </g>
      ))}
    </svg>
  );
};

/** A bank front: roof, columns and steps. */
export const Bank: React.FC<{ width?: number }> = ({ width = 190 }) => (
  <svg width={width} height={(width * 170) / 190} viewBox="0 0 190 170" aria-hidden="true">
    <path d="M95 6 L184 56 H6 Z" fill={c('primary', 7)} />
    <circle cx={95} cy={36} r={8} fill={c('yellow', 3)} />
    {[0, 1, 2, 3].map((index) => (
      <rect
        key={index}
        x={22 + index * 42}
        y={62}
        width={22}
        height={72}
        rx={5}
        fill="color-mix(in srgb, var(--mantine-color-white) 92%, transparent)"
      />
    ))}
    <rect x={8} y={136} width={174} height={12} rx={4} fill={c('primary', 6)} />
    <rect x={0} y={150} width={190} height={14} rx={5} fill={c('primary', 8)} />
  </svg>
);

/** A stack of coins. */
export const Coins: React.FC<{ width?: number }> = ({ width = 90 }) => (
  <svg width={width} height={(width * 90) / 90} viewBox="0 0 90 90" aria-hidden="true">
    {[0, 1, 2, 3].map((index) => (
      <g key={index}>
        <ellipse cx={45} cy={70 - index * 15} rx={36} ry={11} fill={c('yellow', 5)} />
        <rect x={9} y={58 - index * 15} width={72} height={12} fill={c('yellow', 4)} />
        <ellipse cx={45} cy={58 - index * 15} rx={36} ry={11} fill={c('yellow', 3)} />
      </g>
    ))}
  </svg>
);

/** A dotted path with dots that travel along it, the link between two halves of a scene. */
export const FlowLine: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={12} viewBox={`0 0 ${width} 12`} aria-hidden="true">
    <line
      x1={0}
      y1={6}
      x2={width}
      y2={6}
      stroke="color-mix(in srgb, var(--mantine-color-white) 90%, transparent)"
      strokeWidth={3}
      strokeLinecap="round"
      strokeDasharray="2 10"
      className={classes.flow}
    />
  </svg>
);
