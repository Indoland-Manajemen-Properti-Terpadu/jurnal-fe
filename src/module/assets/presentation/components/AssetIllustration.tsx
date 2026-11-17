import type { ReactNode } from 'react';
import classes from '@/module/assets/presentation/components/AssetIllustration.module.css';

export type AssetIllustrationName =
  | 'hero'
  | 'sold'
  | 'scrapped'
  | 'fully_depreciated'
  | 'damaged'
  | 'lost'
  | 'approved'
  | 'rejected'
  | 'allDone'
  | 'submitted';

const c = classes;

/** A carton standing for the asset, shared by the type drawings. */
const crate = (x: number, y: number, fill = c.fl) => (
  <>
    <rect className={fill} x={x} y={y} width="44" height="38" rx="5" />
    <path className={c.ln} d={`M${x} ${y + 12}h44M${x + 16} ${y}v12M${x + 28} ${y}v12`} />
  </>
);

/** A stamp ring with its own mark inside. */
const stamp = (ring: string, fill: string, mark: ReactNode) => (
  <>
    <circle className={fill} cx="60" cy="46" r="34" />
    <circle className={ring} cx="60" cy="46" r="34" />
    <circle className={ring} cx="60" cy="46" r="26" strokeDasharray="2 5" strokeWidth="2" />
    {mark}
  </>
);

/** Line illustrations of the asset module; decorative, so hidden from screen readers. */
const DRAWINGS: Record<AssetIllustrationName, { box: string; art: ReactNode }> = {
  hero: {
    box: '0 0 420 150',
    art: (
      <>
        <rect className={c.fl} x="20" y="46" width="86" height="72" rx="8" />
        <path className={c.ln} d="M20 70h86M50 46v24M76 46v24" />
        <path className={c.fm} d="M34 86h58v8H34z" />
        <path className={`${c.acl} ${c.flow}`} d="M116 82C160 82 176 62 212 62" />
        <path className={c.acl} d="M204 53l10 9-10 9" />
        <rect className={c.fl} x="222" y="16" width="100" height="122" rx="8" />
        <path className={c.ln} d="M240 40h64M240 54h48M240 68h56M240 82h36" />
        <path className={c.acl} d="M242 116c8-12 14 8 22-4s12 6 20-2" />
        <path className={c.ln} d="M240 124h52" />
        <circle className={c.ft} cx="346" cy="104" r="28" />
        <circle className={c.atl} cx="346" cy="104" r="28" />
        <path className={c.atl} d="M334 104l8 8 16-17" />
        <circle className={c.ac} cx="370" cy="34" r="5" />
        <circle className={c.fm} cx="392" cy="58" r="4" />
      </>
    ),
  },
  sold: {
    box: '0 0 120 92',
    art: (
      <>
        <path className={c.fl} d="M18 30l30-18h30v30L48 72 18 54Z" />
        <circle className={c.wh} cx="66" cy="26" r="5" />
        <circle className={c.wh} cx="84" cy="62" r="18" />
        <text className={c.tx} x="75" y="66">
          Rp
        </text>
        <path className={c.acl} d="M34 42l10 6" />
      </>
    ),
  },
  scrapped: {
    box: '0 0 120 92',
    art: (
      <>
        <path className={c.fl} d="M36 34h48l-5 48H41Z" />
        <path className={c.ln} d="M30 34h60M50 26h20v8M52 44v28M60 44v28M68 44v28" />
        <rect
          className={c.fm}
          x="70"
          y="10"
          width="26"
          height="20"
          rx="4"
          transform="rotate(18 83 20)"
        />
        <path className={c.acl} d="M22 20l8 6M18 34h8" />
      </>
    ),
  },
  fully_depreciated: {
    box: '0 0 120 92',
    art: (
      <>
        <path className={c.ln} d="M18 14v62h86" />
        <rect className={c.fm} x="28" y="22" width="12" height="54" rx="3" />
        <rect className={c.fm} x="46" y="38" width="12" height="38" rx="3" />
        <rect className={c.fm} x="64" y="54" width="12" height="22" rx="3" />
        <rect className={c.ac} x="82" y="70" width="12" height="6" rx="2" />
        <path className={c.acl} d="M30 18l58 48" strokeDasharray="3 5" />
      </>
    ),
  },
  damaged: {
    box: '0 0 120 92',
    art: (
      <>
        {crate(30, 32, c.fo)}
        <path className={c.aol} d="M58 32l-6 12 8 4-6 14" />
        <path className={c.ao} d="M86 10l-10 18h8l-6 16 16-22h-9l7-12Z" />
        <path className={c.ln} d="M24 82h72" />
      </>
    ),
  },
  lost: {
    box: '0 0 120 92',
    art: (
      <>
        <rect className={c.dash} x="16" y="30" width="44" height="38" rx="5" />
        <circle className={c.wh} cx="74" cy="40" r="20" />
        <path className={c.ln} d="M88 54l16 16" strokeWidth="4" />
        <path className={c.aol} d="M68 34a6 6 0 1 1 8 6c-2 1-2 3-2 5" />
        <circle className={c.ao} cx="74" cy="51" r="2" />
      </>
    ),
  },
  approved: {
    box: '0 0 120 92',
    art: stamp(c.atl, c.ft, <path className={c.atl} d="M46 46l10 10 19-21" strokeWidth="4" />),
  },
  rejected: {
    box: '0 0 120 92',
    art: stamp(
      c.arl,
      c.fr,
      <path className={c.arl} d="M48 34l24 24M72 34L48 58" strokeWidth="4" />
    ),
  },
  allDone: {
    box: '0 0 160 120',
    art: (
      <>
        <rect className={c.fl} x="42" y="18" width="70" height="90" rx="8" />
        <rect className={c.wh} x="62" y="10" width="30" height="14" rx="4" />
        <path className={c.ln} d="M56 46h16M56 64h16M56 82h16" />
        <path
          className={c.atl}
          d="M78 46l5 5 9-10M78 64l5 5 9-10M78 82l5 5 9-10"
          strokeWidth="2.5"
        />
        <path className={c.acl} d="M126 26v12M120 32h12M24 60v10M19 65h10" />
        <circle className={c.ac} cx="132" cy="80" r="4" />
      </>
    ),
  },
  submitted: {
    box: '0 0 160 120',
    art: (
      <>
        <rect className={c.fl} x="24" y="22" width="66" height="84" rx="8" />
        <path className={c.ln} d="M38 44h38M38 58h30M38 72h36" />
        <path className={c.acl} d="M40 92c6-8 10 6 16-2s8 4 14-1" />
        <path className={c.fm} d="M100 52l46-22-16 52-12-18Z" />
        <path className={c.ln} d="M100 52l46-22-16 52-12-18Zm18 12l28-34" />
        <path className={`${c.acl} ${c.flow}`} d="M96 80c-8 8-16 10-24 10" />
      </>
    ),
  },
};

export function AssetIllustration({
  name,
  maxWidth = 120,
}: Readonly<{ name: AssetIllustrationName; maxWidth?: number }>) {
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

export default AssetIllustration;
