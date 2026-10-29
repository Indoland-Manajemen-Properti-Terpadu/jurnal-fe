import type { SettingActionCardTheme } from './SettingActionCard';

export const SETTING_ACTION_THEMES: Record<
  'import' | 'export' | 'restore',
  SettingActionCardTheme
> = {
  import: {
    iconColor: 'blue',
    buttonColor: 'primary',
    selectedBorder: 'var(--mantine-color-primary-6)',
    selectedBg: 'var(--mantine-color-primary-0)',
    selectedShadow: '0 8px 20px rgba(13, 110, 253, 0.12)',
    frameSelected: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)',
    frameIdle: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
    frameBorder: '1px solid rgba(14, 165, 233, 0.15)',
  },
  export: {
    iconColor: 'teal',
    buttonColor: 'teal',
    selectedBorder: 'var(--mantine-color-teal-6)',
    selectedBg: 'var(--mantine-color-teal-0)',
    selectedShadow: '0 8px 20px rgba(18, 184, 134, 0.12)',
    frameSelected: 'linear-gradient(145deg, #ccfbf1 0%, #99f6e4 100%)',
    frameIdle: 'linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)',
    frameBorder: '1px solid rgba(20, 184, 166, 0.15)',
  },
  restore: {
    iconColor: 'red',
    buttonColor: 'red',
    selectedBorder: 'var(--mantine-color-red-6)',
    selectedBg: 'var(--mantine-color-red-0)',
    selectedShadow: '0 8px 20px rgba(224, 49, 49, 0.12)',
    frameSelected: 'linear-gradient(145deg, #ffe4e6 0%, #fecdd3 100%)',
    frameIdle: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)',
    frameBorder: '1px solid rgba(225, 29, 72, 0.15)',
  },
};
