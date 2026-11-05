import React from 'react';
import { IconArrowDown, IconArrowUpRight, IconCheck, IconRotate2 } from '@tabler/icons-react';

/** Mantine colour scales the scenes are drawn with. Colours come from theme variables only. */
export type SceneScale = 'sky' | 'primary' | 'teal' | 'rose' | 'green';

const shade = (scale: SceneScale | 'gray' | 'white', step?: number) =>
  scale === 'white' ? 'var(--mantine-color-white)' : `var(--mantine-color-${scale}-${step})`;

interface SceneProps {
  light: SceneScale;
  strong: SceneScale;
}

/** A spreadsheet card with a header bar and account rows: the shared motif of every scene. */
const Sheet = ({ x, y, light, strong }: SceneProps & { x: number; y: number }) => (
  <g>
    <rect x={x} y={y + 5} width={84} height={100} rx={10} fill={shade(light, 3)} opacity={0.35} />
    <rect
      x={x}
      y={y}
      width={84}
      height={100}
      rx={10}
      fill={shade('white')}
      stroke={shade('gray', 3)}
      strokeWidth={1.5}
    />
    <circle cx={x + 12} cy={y + 13} r={3} fill={shade(strong, 6)} />
    <circle cx={x + 22} cy={y + 13} r={3} fill={shade(light, 4)} />
    <rect x={x + 44} y={y + 10} width={28} height={6} rx={3} fill={shade('gray', 2)} />
    <rect x={x} y={y + 26} width={84} height={1.5} fill={shade('gray', 2)} />
    {[0, 1, 2, 3].map((row) => {
      const top = y + 36 + row * 15;
      return (
        <g key={row}>
          <rect x={x + 12} y={top} width={10} height={10} rx={3} fill={shade(light, 3)} />
          <rect
            x={x + 28}
            y={top + 2.5}
            width={row % 2 ? 26 : 34}
            height={5}
            rx={2.5}
            fill={shade('gray', 3)}
          />
          <rect x={x + 60} y={top + 2.5} width={12} height={5} rx={2.5} fill={shade(light, 4)} />
        </g>
      );
    })}
  </g>
);

const Decor = ({ light, strong }: SceneProps) => (
  <g>
    <circle cx={38} cy={42} r={6} fill={shade(light, 3)} opacity={0.7} />
    <circle cx={206} cy={104} r={8} fill={shade(light, 3)} opacity={0.6} />
    <circle cx={52} cy={112} r={3.5} fill={shade(strong, 4)} opacity={0.6} />
    <circle cx={198} cy={44} r={3} fill={shade(strong, 4)} opacity={0.5} />
    <path
      d="M30 84h10M35 79v10"
      stroke={shade(strong, 4)}
      strokeWidth={2.5}
      strokeLinecap="round"
      opacity={0.6}
    />
  </g>
);

const Badge = ({
  cx,
  cy,
  strong,
  children,
}: {
  cx: number;
  cy: number;
  strong: SceneScale;
  children: React.ReactNode;
}) => (
  <g>
    <circle cx={cx} cy={cy} r={19} fill={shade('white')} opacity={0.9} />
    <circle cx={cx} cy={cy} r={15} fill={shade(strong, 6)} />
    {children}
  </g>
);

const Scene = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 240 140"
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

/** A sheet dropping into a tray: bringing accounts in. */
export const ImportIllustration = () => (
  <Scene>
    <Decor light="sky" strong="primary" />
    <Sheet x={78} y={8} light="sky" strong="primary" />
    <path d="M64 100h112v12a8 8 0 0 1-8 8H72a8 8 0 0 1-8-8z" fill={shade('primary', 6)} />
    <rect x={64} y={96} width={112} height={8} rx={4} fill={shade('primary', 7)} />
    <Badge cx={176} cy={34} strong="primary">
      <IconArrowDown x={163} y={21} size={26} color={shade('white')} stroke={3} />
    </Badge>
  </Scene>
);

/** A sheet with an Excel grid chip and an outgoing arrow: taking accounts out. */
export const ExportIllustration = () => (
  <Scene>
    <Decor light="teal" strong="teal" />
    <Sheet x={68} y={14} light="teal" strong="teal" />
    <g>
      <rect x={134} y={86} width={46} height={32} rx={8} fill={shade('teal', 6)} />
      <path
        d="M144 98h26M144 106h26M154 94v20"
        stroke={shade('white')}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.9}
      />
    </g>
    <Badge cx={170} cy={34} strong="teal">
      <IconArrowUpRight x={157} y={21} size={26} color={shade('white')} stroke={3} />
    </Badge>
  </Scene>
);

/** A sheet with a restore arrow: returning to the standard layout. */
export const RestoreIllustration = () => (
  <Scene>
    <Decor light="rose" strong="rose" />
    <Sheet x={70} y={12} light="rose" strong="rose" />
    <Badge cx={162} cy={96} strong="rose">
      <IconRotate2 x={149} y={83} size={26} color={shade('white')} stroke={2.6} />
    </Badge>
  </Scene>
);

/** A large check with sparks: the flow finished. */
export const DoneIllustration = () => (
  <Scene>
    <circle cx={120} cy={70} r={50} fill={shade('green', 2)} opacity={0.5} />
    <circle cx={120} cy={70} r={38} fill={shade('green', 3)} opacity={0.6} />
    <circle cx={120} cy={70} r={28} fill={shade('green', 6)} />
    <IconCheck x={104} y={54} size={32} color={shade('white')} stroke={3.2} />
    <g strokeLinecap="round" strokeWidth={3}>
      <path d="M52 40l8 8M60 40l-8 8" stroke={shade('green', 4)} />
      <path d="M184 36v12M178 42h12" stroke={shade('green', 4)} />
      <path d="M190 100l7 7M197 100l-7 7" stroke={shade('green', 3)} />
      <path d="M44 100h12" stroke={shade('green', 3)} />
    </g>
    <circle cx={64} cy={78} r={4} fill={shade('green', 4)} opacity={0.7} />
    <circle cx={178} cy={82} r={5} fill={shade('green', 3)} opacity={0.8} />
  </Scene>
);
