import { type ComponentType } from 'react';
import { Box } from '@mantine/core';
import classes from './dashboard.module.css';

const GRADIENTS: Record<string, [string, string, string]> = {
  primary: [
    'var(--mantine-color-primary-6)',
    'var(--mantine-color-primary-7)',
    'color-mix(in srgb, var(--mantine-color-primary-6) 45%, transparent)',
  ],
  cyan: [
    'var(--mantine-color-sky-6)',
    'var(--mantine-color-secondary-6)',
    'color-mix(in srgb, var(--mantine-color-secondary-6) 45%, transparent)',
  ],
  teal: [
    'var(--mantine-color-teal-7)',
    'var(--mantine-color-teal-5)',
    'color-mix(in srgb, var(--mantine-color-teal-5) 45%, transparent)',
  ],
  orange: [
    'var(--mantine-color-orange-7)',
    'var(--mantine-color-amber-5)',
    'color-mix(in srgb, var(--mantine-color-amber-5) 45%, transparent)',
  ],
  red: [
    'var(--mantine-color-red-7)',
    'var(--mantine-color-red-5)',
    'color-mix(in srgb, var(--mantine-color-red-5) 45%, transparent)',
  ],
  violet: [
    'var(--mantine-color-violet-8)',
    'var(--mantine-color-violet-5)',
    'color-mix(in srgb, var(--mantine-color-violet-5) 45%, transparent)',
  ],
};

export function IconOrb({
  icon: Icon,
  tone = 'primary',
}: Readonly<{ icon: ComponentType<{ size?: number | string }>; tone?: string }>) {
  const [a, b, s] = GRADIENTS[tone] ?? GRADIENTS.primary;
  return (
    <Box
      className={classes.iconOrb}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})`, ['--orb-shadow' as string]: s }}
    >
      <Icon size={22} />
    </Box>
  );
}
