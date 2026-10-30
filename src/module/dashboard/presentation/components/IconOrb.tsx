import { type ComponentType } from 'react';
import { Box } from '@mantine/core';
import classes from './dashboard.module.css';

const GRADIENTS: Record<string, [string, string, string]> = {
  primary: ['#053079', '#0a4fb5', 'rgba(5,48,121,0.45)'],
  cyan: ['#0284c7', '#09B2FF', 'rgba(9,178,255,0.45)'],
  teal: ['#0f766e', '#14b8a6', 'rgba(20,184,166,0.45)'],
  orange: ['#c2410c', '#f59e0b', 'rgba(245,158,11,0.45)'],
  red: ['#b91c1c', '#ef4444', 'rgba(239,68,68,0.45)'],
  violet: ['#5b21b6', '#8b5cf6', 'rgba(139,92,246,0.45)'],
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
