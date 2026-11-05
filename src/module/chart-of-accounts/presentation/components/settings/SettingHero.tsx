import React from 'react';
import classes from './SettingModals.module.css';
import {
  DoneIllustration,
  ExportIllustration,
  ImportIllustration,
  RestoreIllustration,
} from './SettingIllustrations';
import { SETTING_TONES, type SettingTone } from './settingActionThemes';

const SCENES: Record<SettingTone, React.FC> = {
  import: ImportIllustration,
  export: ExportIllustration,
  restore: RestoreIllustration,
  done: DoneIllustration,
};

interface SettingHeroProps {
  tone: SettingTone;
  height?: number;
}

/** Tinted frame around the illustration of an option; every setting modal uses it. */
export const SettingHero: React.FC<SettingHeroProps> = ({ tone, height = 132 }) => {
  const { scale } = SETTING_TONES[tone];
  const Scene = SCENES[tone];
  return (
    <div
      className={classes.hero}
      style={{
        height,
        background: `linear-gradient(145deg, var(--mantine-color-${scale}-0) 0%, var(--mantine-color-${scale}-1) 100%)`,
        border: `1px solid color-mix(in srgb, var(--mantine-color-${scale}-5) 18%, transparent)`,
      }}
    >
      <Scene />
    </div>
  );
};
