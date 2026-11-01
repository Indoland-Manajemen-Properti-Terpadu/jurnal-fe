import { Badge, Box, Group, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { sumPositive } from '@/module/dashboard/domain/dashboardTotals';
import { formatCompact, formatIDR } from './dashboardFormat';

/* ---------- Balance Sheet Composition Donut + Plain-Language Insight ---------- */

type Slice = { label: string; value: number; color: string };

export function CompositionDonut({
  slices,
  centerLabel,
  centerValue,
  netWorkingCapital,
  loading,
}: Readonly<{
  slices: Slice[];
  centerLabel: string;
  centerValue: string;
  netWorkingCapital?: number;
  loading?: boolean;
}>) {
  const { t } = useTranslation('dashboard');

  if (loading) return <Skeleton h={220} radius="lg" />;
  const total = sumPositive(slices.map((s) => s.value));
  const r = 68;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Stack gap="md">
      <Group align="center" gap="xl" wrap="wrap" justify="center">
        <Box pos="relative" w={176} h={176}>
          <svg viewBox="0 0 180 180" width={176} height={176} role="img" aria-label={centerLabel}>
            <circle
              cx={90}
              cy={90}
              r={r}
              fill="none"
              stroke="color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)"
              strokeWidth={20}
            />
            {total > 0 &&
              slices.map((s) => {
                const len = (Math.max(0, s.value) / total) * c;
                const el = (
                  <circle
                    key={s.label}
                    cx={90}
                    cy={90}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={20}
                    strokeDasharray={`${len} ${c - len}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    transform="rotate(-90 90 90)"
                  />
                );
                offset += len;
                return el;
              })}
          </svg>
          <Stack gap={0} align="center" justify="center" pos="absolute" inset={0}>
            <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600}>
              {centerLabel}
            </Text>
            <Text fw={800} c="dark.9" size="md">
              {centerValue}
            </Text>
          </Stack>
        </Box>

        <Stack gap="xs" style={{ flex: 1, minWidth: 200 }}>
          {slices.map((s) => {
            const pct = total > 0 ? Math.round((Math.max(0, s.value) / total) * 100) : 0;
            return (
              <Box
                key={s.label}
                p={8}
                style={{
                  borderRadius: 10,
                  border:
                    '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 5%, transparent)',
                  backgroundColor:
                    'color-mix(in srgb, var(--mantine-color-white) 55%, transparent)',
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Box w={10} h={10} style={{ borderRadius: 3, background: s.color }} />
                    <Text size="xs" fw={600} c="dark.8">
                      {s.label}
                    </Text>
                  </Group>
                  <Group gap={6} wrap="nowrap">
                    <Text size="xs" fw={700} c="dark.9">
                      {formatCompact(s.value)}
                    </Text>
                    <Badge size="xs" variant="light" color="gray">
                      {pct}%
                    </Badge>
                  </Group>
                </Group>
              </Box>
            );
          })}
        </Stack>
      </Group>

      {typeof netWorkingCapital === 'number' && (
        <Box
          p="sm"
          style={{
            borderRadius: 12,
            backgroundColor: 'color-mix(in srgb, var(--mantine-color-secondary-6) 6%, transparent)',
            border:
              '1px solid color-mix(in srgb, var(--mantine-color-secondary-6) 20%, transparent)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={26} radius="md" variant="light" color="primary">
                <IconInfoCircle size={15} />
              </ThemeIcon>
              <Box>
                <Text size="xs" fw={700} c="primary.9">
                  {t('netWorkingCapital')}
                </Text>
                <Text fz="var(--jurnal-text-xs)" c="dimmed">
                  {t('insightWorkingCapitalDesc')}
                </Text>
              </Box>
            </Group>
            <Text size="sm" fw={800} c={netWorkingCapital >= 0 ? 'teal.8' : 'red.7'}>
              {formatIDR(netWorkingCapital)}
            </Text>
          </Group>
        </Box>
      )}
    </Stack>
  );
}
