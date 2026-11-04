import type { StatusTone } from '@/module/petty-cash/domain/pettyCashStatus';

/** Mantine color of each semantic tone; red is only for a refusal, never for a normal expense. */
export const TONE_COLOR: Record<StatusTone, string> = {
  neutral: 'gray',
  info: 'blue',
  warning: 'orange',
  success: 'teal',
  danger: 'red',
  muted: 'gray',
};
