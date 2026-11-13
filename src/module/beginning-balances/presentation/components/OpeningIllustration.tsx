import type { ReactNode } from 'react';
import classes from '@/module/beginning-balances/presentation/components/OpeningIllustration.module.css';

export type OpeningIllustrationName =
  | 'hero'
  | 'bank'
  | 'invoices'
  | 'stock'
  | 'equity'
  | 'cutoff'
  | 'blocked';

const c = classes;

/** A calendar frame with its two binder rings, shared by the cut-off and blocked drawings. */
const calendar = (
  <>
    <rect className={c.fl} x="18" y="16" width="84" height="66" rx="8" />
    <path className={c.ln} d="M18 36h84M40 10v12M80 10v12" />
  </>
);

/** One layer of the coin stack. */
const coinLayer = (y: number) => (
  <>
    <path className={c.fl} d={`M30 ${y}v12a30 10 0 0 0 60 0V${y}`} />
    <ellipse className={c.fl} cx="60" cy={y} rx="30" ry="10" />
  </>
);

/** Line illustrations drawn for this module; decorative, so they are hidden from screen readers. */
const DRAWINGS: Record<OpeningIllustrationName, { box: string; art: ReactNode }> = {
  hero: {
    box: '0 0 420 150',
    art: (
      <>
        <rect className={c.fl} x="16" y="20" width="92" height="112" rx="8" />
        <path className={c.ln} d="M46 46h50M46 64h50M46 82h50M46 100h32" />
        <circle className={c.ac} cx="30" cy="46" r="4" />
        <circle className={c.fm} cx="30" cy="64" r="4" />
        <circle className={c.ac} cx="30" cy="82" r="4" />
        <circle className={c.fm} cx="30" cy="100" r="4" />
        <path className={c.ln} d="M210 40v84M186 124h48M168 56h84" />
        <path className={c.ln} d="M174 56l-12 28M174 56l12 28M246 56l-12 28M246 56l12 28" />
        <path className={c.fl} d="M158 84h32a16 16 0 0 1-32 0Z" />
        <path className={c.fl} d="M230 84h32a16 16 0 0 1-32 0Z" />
        <circle className={c.wh} cx="210" cy="56" r="7" />
        <circle className={c.ac} cx="174" cy="77" r="6" />
        <circle className={c.ac} cx="246" cy="77" r="6" />
        <path className={`${c.acl} ${c.flow}`} d="M270 96C292 96 300 88 314 82" />
        <path className={c.acl} d="M306 74l10 8-10 8" />
        <rect className={c.fl} x="324" y="20" width="84" height="112" rx="8" />
        <path className={c.fm} d="M332 20h10v112h-10a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Z" />
        <path className={c.ln} d="M342 20v112M358 52h38M358 66h26" />
        <path className={c.ac} d="M380 20v30l8-6 8 6V20Z" />
        <circle className={c.wh} cx="386" cy="108" r="16" />
        <path className={c.acl} d="M378 108l6 6 11-12" />
      </>
    ),
  },
  bank: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fl} x="24" y="40" width="72" height="40" rx="4" />
        <path className={c.fl} d="M16 40L60 12L104 40Z" />
        <path className={c.ln} d="M38 52v20M54 52v20M70 52v20M86 52v20M16 80h88" />
        <circle className={c.ac} cx="60" cy="30" r="5" />
      </>
    ),
  },
  invoices: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.fm} x="14" y="18" width="50" height="62" rx="6" />
        <rect className={c.fl} x="40" y="10" width="54" height="64" rx="6" />
        <path className={c.ln} d="M50 28h34M50 40h34M50 52h18" />
        <circle className={c.wh} cx="88" cy="66" r="14" />
        <text className={c.tx} x="79" y="70">
          Rp
        </text>
      </>
    ),
  },
  stock: {
    box: '0 0 120 92',
    art: (
      <>
        <path className={c.fl} d="M60 12l34 14v38L60 78 26 64V26Z" />
        <path className={c.ln} d="M26 26l34 14 34-14M60 40v38" />
        <path className={c.fm} d="M26 26l34 14v38L26 64Z" />
        <circle className={c.ac} cx="82" cy="58" r="5" />
      </>
    ),
  },
  equity: {
    box: '0 0 120 92',
    art: (
      <>
        {coinLayer(58)}
        {coinLayer(44)}
        {coinLayer(30)}
        <path className={c.acl} d="M50 30h20" />
      </>
    ),
  },
  cutoff: {
    box: '0 0 120 92',
    art: (
      <>
        {calendar}
        <path className={c.ln} d="M32 52h8M48 52h8M32 68h8M48 68h8" />
        <path className={c.ln} d="M80 44v34" />
        <path className={c.ac} d="M80 44h18l-5 7 5 7H80Z" />
      </>
    ),
  },
  blocked: {
    box: '0 0 120 92',
    art: (
      <>
        {calendar}
        <path className={c.ln} d="M32 52h8M48 52h8M32 68h8M48 68h8" />
        <circle className={c.wh} cx="86" cy="66" r="17" />
        <path className={c.orl} d="M86 57v11" />
        <circle className={c.ao} cx="86" cy="75" r="2.2" />
      </>
    ),
  },
};

export function OpeningIllustration({
  name,
  maxWidth = 120,
}: Readonly<{ name: OpeningIllustrationName; maxWidth?: number }>) {
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
