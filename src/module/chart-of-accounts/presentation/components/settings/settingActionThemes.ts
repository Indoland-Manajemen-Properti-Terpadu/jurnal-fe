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
    selectedShadow: '0 8px 20px color-mix(in srgb, var(--mantine-color-blue-6) 12%, transparent)',
    frameSelected:
      'linear-gradient(145deg, var(--mantine-color-sky-1) 0%, var(--mantine-color-sky-2) 100%)',
    frameIdle:
      'linear-gradient(145deg, var(--mantine-color-sky-0) 0%, var(--mantine-color-sky-1) 100%)',
    frameBorder: '1px solid color-mix(in srgb, var(--mantine-color-sky-5) 15%, transparent)',
  },
  export: {
    iconColor: 'teal',
    buttonColor: 'teal',
    selectedBorder: 'var(--mantine-color-teal-6)',
    selectedBg: 'var(--mantine-color-teal-0)',
    selectedShadow: '0 8px 20px color-mix(in srgb, var(--mantine-color-teal-5) 12%, transparent)',
    frameSelected:
      'linear-gradient(145deg, var(--mantine-color-teal-1) 0%, var(--mantine-color-teal-2) 100%)',
    frameIdle:
      'linear-gradient(145deg, var(--mantine-color-teal-0) 0%, var(--mantine-color-teal-1) 100%)',
    frameBorder: '1px solid color-mix(in srgb, var(--mantine-color-teal-5) 15%, transparent)',
  },
  restore: {
    iconColor: 'red',
    buttonColor: 'red',
    selectedBorder: 'var(--mantine-color-red-6)',
    selectedBg: 'var(--mantine-color-red-0)',
    selectedShadow: '0 8px 20px color-mix(in srgb, var(--mantine-color-red-6) 12%, transparent)',
    frameSelected:
      'linear-gradient(145deg, var(--mantine-color-rose-1) 0%, var(--mantine-color-rose-2) 100%)',
    frameIdle:
      'linear-gradient(145deg, var(--mantine-color-rose-0) 0%, var(--mantine-color-rose-1) 100%)',
    frameBorder: '1px solid color-mix(in srgb, var(--mantine-color-rose-6) 15%, transparent)',
  },
};
