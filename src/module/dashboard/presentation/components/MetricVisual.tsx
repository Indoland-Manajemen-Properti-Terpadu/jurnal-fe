import { Box, Progress, RingProgress, Text } from '@mantine/core';
import classes from './dashboard.module.css';

type VisualPoint = { label: string; value: number };

export function MiniBars({
  points,
  label,
  warning = false,
}: Readonly<{
  points: VisualPoint[];
  label: string;
  warning?: boolean;
}>) {
  const max = Math.max(1, ...points.map((point) => Math.max(0, point.value)));
  return (
    <Box>
      <Box className={classes.miniBars} role="img" aria-label={label}>
        {points.map((point, index) => (
          <span
            key={point.label}
            title={point.label}
            className={classes.miniBar}
            data-last={index === points.length - 1 || undefined}
            data-warning={warning || undefined}
            style={{ height: `${(Math.max(0, point.value) / max) * 100}%` }}
          />
        ))}
      </Box>
      <Text className={classes.miniCaption}>{label}</Text>
    </Box>
  );
}

export function CollectionRing({ rate, label }: Readonly<{ rate: number; label: string }>) {
  return (
    <Box>
      <RingProgress
        size={68}
        thickness={6}
        roundCaps
        sections={[{ value: Math.min(100, Math.max(0, rate)), color: 'primary.5' }]}
        label={
          <Text ta="center" size="xs" fw={600}>
            {rate.toFixed(0)}%
          </Text>
        }
        aria-label={`${label}: ${rate.toFixed(1)}%`}
      />
      <Text className={classes.miniCaption}>{label}</Text>
    </Box>
  );
}

export function OverdueShare({
  amount,
  total,
  label,
}: Readonly<{ amount: number; total: number; label: string }>) {
  const share = total > 0 ? (amount / total) * 100 : 0;
  return (
    <Box w={72}>
      <Text size="lg" fw={600} c={share > 0 ? 'orange.8' : 'dimmed'} ta="right">
        {share.toFixed(0)}%
      </Text>
      <Progress
        mt={6}
        mb={6}
        value={share}
        size={6}
        radius="xl"
        color="orange.5"
        aria-label={label}
      />
      <Text className={classes.miniCaption}>{label}</Text>
    </Box>
  );
}
