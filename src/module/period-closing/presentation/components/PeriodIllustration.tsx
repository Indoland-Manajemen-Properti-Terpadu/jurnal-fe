import type { ReactNode } from 'react';
import classes from '@/module/period-closing/presentation/components/PeriodIllustration.module.css';

export type PeriodIllustrationName =
  | 'hero'
  | 'closed'
  | 'locked'
  | 'open'
  | 'lockPeriod'
  | 'closeBooks'
  | 'empty';

const c = classes;

/** A calendar frame with its two binder rings, shared by the lock, open and empty drawings. */
const calendar = (fill: string) => (
  <>
    <rect className={fill} x="18" y="16" width="84" height="66" rx="8" />
    <path className={c.ln} d="M18 36h84M40 10v12M80 10v12" />
  </>
);

/** Line illustrations drawn for this module; decorative, so they are hidden from screen readers. */
const DRAWINGS: Record<PeriodIllustrationName, { box: string; art: ReactNode }> = {
  hero: {
    box: '0 0 420 150',
    art: (
      <>
        <rect className={c.fl} x="16" y="20" width="96" height="112" rx="8" />
        <path className={c.ln} d="M32 44h40M32 58h56M32 72h30" />
        <rect className={c.fm} x="32" y="88" width="14" height="28" rx="3" />
        <rect className={c.ac} x="54" y="76" width="14" height="40" rx="3" />
        <rect className={c.fm} x="76" y="96" width="14" height="20" rx="3" />
        <path className={`${c.acl} ${c.flow}`} d="M120 84C176 84 236 56 286 68" />
        <path className={c.acl} d="M278 58l10 10-10 10" />
        <circle className={c.wh} cx="172" cy="78" r="14" />
        <text className={c.tx} x="163" y="82">
          Rp
        </text>
        <circle className={c.wh} cx="236" cy="66" r="14" />
        <text className={c.tx} x="227" y="70">
          Rp
        </text>
        <rect className={c.fl} x="302" y="20" width="96" height="112" rx="8" />
        <path className={c.fm} d="M310 20h10v112h-10a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Z" />
        <path className={c.ln} d="M334 52h44M334 66h30M320 20v112" />
        <path className={c.ac} d="M366 20v30l8-6 8 6V20Z" />
        <rect className={c.wh} x="358" y="98" width="42" height="34" rx="8" />
        <path className={c.ln} d="M368 98v-7a11 11 0 0 1 22 0v7" />
        <circle className={c.ao} cx="379" cy="113" r="4" />
        <path className={c.ln} d="M379 116v6" />
      </>
    ),
  },
  closed: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fl} x="26" y="10" width="62" height="72" rx="7" />
        <path className={c.fm} d="M33 10h12v72H33a7 7 0 0 1-7-7V17a7 7 0 0 1 7-7Z" />
        <path className={c.ln} d="M45 10v72M57 32h22M57 44h16" />
        <path className={c.ac} d="M72 10v24l6-5 6 5V10Z" />
        <circle className={c.wh} cx="88" cy="66" r="15" />
        <path className={c.acl} d="M81 66l5 5 9-10" />
      </>
    ),
  },
  locked: {
    box: '0 0 120 92',
    art: (
      <>
        {calendar(c.fl)}
        <rect className={c.fo} x="30" y="46" width="58" height="10" rx="3" />
        <path className={c.ln} d="M34 70h8M50 70h8" />
        <rect className={c.wh} x="66" y="54" width="36" height="28" rx="7" />
        <path className={c.ln} d="M74 54v-5a10 10 0 0 1 20 0v5" />
        <circle className={c.ao} cx="84" cy="66" r="3.5" />
        <path className={c.ln} d="M84 69v5" />
      </>
    ),
  },
  open: {
    box: '0 0 120 92',
    art: (
      <>
        {calendar(c.fl)}
        <path className={c.ln} d="M32 50h8M48 50h8M64 50h8M80 50h8M32 66h8M48 66h8" />
        <circle className={c.at} cx="76" cy="68" r="10" />
        <path className={c.mark} d="M71 68l4 4 7-8" />
      </>
    ),
  },
  lockPeriod: {
    box: '0 0 140 100',
    art: (
      <>
        <rect className={c.fl} x="14" y="18" width="92" height="70" rx="8" />
        <path className={c.ln} d="M14 38h92M38 12v12M82 12v12" />
        <rect className={c.fo} x="26" y="48" width="64" height="11" rx="3" />
        <path className={c.ln} d="M30 74h9M47 74h9M64 74h9" />
        <rect className={c.wh} x="84" y="54" width="42" height="34" rx="8" />
        <path className={c.ln} d="M94 54v-7a11 11 0 0 1 22 0v7" />
        <circle className={c.ao} cx="105" cy="69" r="4" />
        <path className={c.ln} d="M105 73v6" />
      </>
    ),
  },
  closeBooks: {
    box: '0 0 140 100',
    art: (
      <>
        <rect className={c.fl} x="8" y="22" width="44" height="58" rx="6" />
        <path className={c.ln} d="M18 40h24M18 52h24M18 64h14" />
        <path className={`${c.acl} ${c.flow}`} d="M54 52h34" />
        <circle className={c.wh} cx="70" cy="52" r="12" />
        <text className={c.tx} x="61" y="56">
          Rp
        </text>
        <rect className={c.fl} x="92" y="14" width="40" height="72" rx="6" />
        <path className={c.fm} d="M98 14h8v72h-8a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" />
        <path className={c.ln} d="M106 14v72M114 40h12M114 52h8" />
        <path className={c.ac} d="M122 14v20l5-4 5 4V14Z" />
      </>
    ),
  },
  empty: {
    box: '0 0 120 92',
    art: (
      <>
        {calendar(c.fl)}
        <path className={c.acl} d="M60 50v16M52 58h16" />
        <path className={c.ln} d="M30 48h6M84 48h6M30 72h6M84 72h6" strokeDasharray="1 5" />
      </>
    ),
  },
};

export function PeriodIllustration({
  name,
  maxWidth = 120,
}: Readonly<{ name: PeriodIllustrationName; maxWidth?: number }>) {
  const { box, art } = DRAWINGS[name];
  const [, , w, h] = box.split(' ').map(Number);
  return (
    <svg
      viewBox={box}
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'block',
        width: '100%',
        maxWidth,
        aspectRatio: `${w} / ${h}`,
        height: 'auto',
      }}
    >
      {art}
    </svg>
  );
}
