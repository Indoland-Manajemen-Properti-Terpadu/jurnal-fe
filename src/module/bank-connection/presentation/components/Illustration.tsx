import type { ReactNode } from 'react';
import classes from '@/module/bank-connection/presentation/components/Illustration.module.css';

export type IllustrationName =
  | 'hero'
  | 'reconcile'
  | 'feed'
  | 'control'
  | 'secure'
  | 'review'
  | 'sign'
  | 'linked'
  | 'expire'
  | 'plug'
  | 'fix'
  | 'pause'
  | 'stop'
  | 'empty';

const c = classes;

/** Line illustrations drawn for this module; decorative, so they are hidden from screen readers. */
const DRAWINGS: Record<IllustrationName, { box: string; art: ReactNode }> = {
  hero: {
    box: '0 0 420 150',
    art: (
      <>
        <rect className={c.fl} x="16" y="62" width="100" height="70" rx="4" />
        <path className={c.fl} d="M8 62L66 22L124 62Z" />
        <path className={c.ln} d="M34 78v42M54 78v42M78 78v42M98 78v42M8 132h116" />
        <circle className={c.ac} cx="66" cy="48" r="7" />
        <rect className={c.fl} x="296" y="30" width="108" height="94" rx="8" />
        <path
          className={c.ln}
          d="M350 30v94M310 50h26M310 64h26M310 78h18M364 50h26M364 64h26M364 78h18"
        />
        <path className={`${c.acl} ${c.flow}`} d="M128 96C180 96 240 60 292 76" />
        <circle className={c.wh} cx="176" cy="84" r="14" />
        <text className={c.tx} x="167" y="88">
          Rp
        </text>
        <circle className={c.wh} cx="244" cy="70" r="14" />
        <text className={c.tx} x="235" y="74">
          Rp
        </text>
      </>
    ),
  },
  reconcile: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fl} x="8" y="12" width="46" height="62" rx="6" />
        <path className={c.ln} d="M17 28h28M17 38h28M17 48h18" />
        <rect className={c.fl} x="66" y="18" width="46" height="62" rx="6" />
        <path className={c.ln} d="M75 34h28M75 44h28M75 54h18" />
        <circle className={c.wh} cx="60" cy="46" r="13" />
        <path className={c.acl} d="M53 46l5 5 9-10" />
      </>
    ),
  },
  feed: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fm} x="30" y="10" width="74" height="42" rx="7" />
        <rect className={c.fl} x="22" y="20" width="74" height="42" rx="7" />
        <rect className={c.fl} x="14" y="30" width="74" height="42" rx="7" />
        <path className={c.ln} d="M24 58h30M24 66h14" />
        <text className={c.tx} x="22" y="50">
          Rp
        </text>
        <circle className={c.wh} cx="92" cy="66" r="17" />
        <path className={c.ln} d="M92 55v11l8 5" />
      </>
    ),
  },
  control: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fl} x="16" y="10" width="88" height="72" rx="8" />
        <circle className={c.ac} cx="34" cy="30" r="7" />
        <path className={c.ln} d="M31 30l2.5 2.5 4-5M50 30h38" />
        <circle className={c.ac} cx="34" cy="50" r="7" />
        <path className={c.ln} d="M31 50l2.5 2.5 4-5M50 50h30" />
        <circle className={c.wh} cx="34" cy="70" r="7" strokeDasharray="3 3" />
        <path className={c.ln} d="M50 70h24" strokeDasharray="3 4" />
      </>
    ),
  },
  secure: {
    box: '0 0 120 92',
    art: (
      <>
        <path className={c.fl} d="M60 6L96 19V44C96 64 80 76 60 84 40 76 24 64 24 44V19Z" />
        <rect className={c.wh} x="47" y="40" width="26" height="20" rx="4" />
        <path className={c.ln} d="M52 40v-6a8 8 0 0 1 16 0v6" />
        <circle className={c.ac} cx="60" cy="50" r="3" />
      </>
    ),
  },
  review: {
    box: '0 0 160 130',
    art: (
      <>
        <rect className={c.fl} x="26" y="14" width="76" height="98" rx="8" />
        <path className={c.ln} d="M40 34h48M40 48h48M40 62h30" />
        <circle className={c.wh} cx="100" cy="82" r="22" />
        <path className={c.ln} d="M116 98l18 18" />
        <path className={c.acl} d="M90 82l7 7 13-14" />
      </>
    ),
  },
  sign: {
    box: '0 0 160 130',
    art: (
      <>
        <rect className={c.fl} x="30" y="12" width="84" height="104" rx="8" />
        <path className={c.ln} d="M44 32h56M44 46h56M44 60h36" />
        <path className={c.acl} d="M46 94c6-14 10-14 12-4s6 8 10-2 8-6 12 2" />
        <path className={c.fl} d="M104 74l24-24 10 10-24 24-14 4z" />
        <path className={c.ln} d="M128 50l10 10" />
      </>
    ),
  },
  linked: {
    box: '0 0 160 130',
    art: (
      <>
        <rect className={c.fl} x="22" y="40" width="64" height="40" rx="20" />
        <rect className={c.fl} x="74" y="40" width="64" height="40" rx="20" />
        <path className={c.ln} d="M60 60h40" strokeDasharray="2 6" />
        <circle className={c.ac} cx="80" cy="96" r="16" />
        <path className={c.mark} d="M72 96l6 6 11-12" />
      </>
    ),
  },
  expire: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fl} x="18" y="16" width="70" height="62" rx="8" />
        <path className={c.ln} d="M18 34h70M36 10v14M70 10v14" />
        <circle className={c.ac} cx="86" cy="64" r="17" />
        <path className={c.mark} d="M86 55v11M86 71v1" />
      </>
    ),
  },
  plug: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fl} x="8" y="34" width="38" height="26" rx="8" />
        <path className={c.ln} d="M46 42h10M46 52h10" />
        <rect className={c.fl} x="72" y="34" width="40" height="26" rx="8" />
        <path className={c.acl} d="M58 26l-6 12h8l-6 12" />
        <path className={c.ln} d="M64 66l-4 8M70 64l2 8" />
      </>
    ),
  },
  fix: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fl} x="22" y="10" width="64" height="72" rx="8" />
        <path className={c.ln} d="M34 30h40M34 42h40M34 54h22" />
        <path className={c.fl} d="M78 60l22-22 9 9-22 22-12 3z" />
        <path className={c.acl} d="M96 42l9 9" />
      </>
    ),
  },
  pause: {
    box: '0 0 120 92',
    art: (
      <>
        <circle className={c.fl} cx="60" cy="46" r="32" />
        <path className={c.ln} d="M52 34v24M68 34v24" strokeWidth="5" />
      </>
    ),
  },
  stop: {
    box: '0 0 120 92',
    art: (
      <>
        <circle className={c.fl} cx="60" cy="46" r="32" />
        <path className={c.acl} d="M46 32l28 28M74 32L46 60" />
      </>
    ),
  },
  empty: {
    box: '0 0 120 92',
    art: (
      <>
        <path className={c.fl} d="M18 50l14-28h56l14 28v26a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" />
        <path className={c.ln} d="M18 50h30a12 12 0 0 0 24 0h30" />
        <path className={c.acl} d="M60 12v12M44 16l4 9M76 16l-4 9" />
      </>
    ),
  },
};

export function Illustration({
  name,
  maxWidth = 120,
}: Readonly<{ name: IllustrationName; maxWidth?: number }>) {
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
