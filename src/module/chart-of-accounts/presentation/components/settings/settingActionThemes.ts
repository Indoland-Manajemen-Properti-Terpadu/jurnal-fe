import type { SceneScale } from './SettingIllustrations';

export type SettingTone = 'import' | 'export' | 'restore' | 'done';

export interface SettingToneTheme {
  /** Mantine colour of the icon tile and of the action button. */
  color: string;
  /** Scale of the illustration frame. */
  scale: SceneScale;
}

export const SETTING_TONES: Record<SettingTone, SettingToneTheme> = {
  import: { color: 'primary', scale: 'sky' },
  export: { color: 'teal', scale: 'teal' },
  restore: { color: 'red', scale: 'rose' },
  done: { color: 'green', scale: 'green' },
};
