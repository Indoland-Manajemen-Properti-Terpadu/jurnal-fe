import { type ComponentType, type ReactNode } from 'react';
import { Box, Group, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { GlassCard } from './GlassCard';
import { IconOrb } from './IconOrb';

/* ---------- Spatial KPI Tile ---------- */

type KpiTileProps = {
  label: string;
  value: string;
  description?: string;
  hint?: ReactNode;
  icon: ComponentType<{ size?: number | string }>;
  tone?: string;
  loading?: boolean;
  delay?: number;
  spatialTilt?: boolean;
  onClick?: () => void;
};

export function KpiTile({
  label,
  value,
  description,
  hint,
  icon,
  tone = 'primary',
  loading,
  delay,
  spatialTilt = true,
  onClick,
}: Readonly<KpiTileProps>) {
  const content = (
    <GlassCard lift spatialTilt={spatialTilt} delay={delay} h="100%">
      <Stack justify="space-between" h="100%" gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.6}>
              {label}
            </Text>
            {loading ? (
              <Skeleton h={30} w={150} mt={8} radius="md" />
            ) : (
              <Text fz={{ base: 21, xl: 23 }} fw={800} c="dark.9" mt={6} lh={1.15} truncate>
                {value}
              </Text>
            )}
            {description && (
              <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={4} lh={1.35}>
                {description}
              </Text>
            )}
          </Box>
          <IconOrb icon={icon} tone={tone} />
        </Group>

        {hint && (
          <Box
            pt={8}
            style={{
              borderTop:
                '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)',
            }}
          >
            <Group justify="space-between" align="center" wrap="nowrap">
              <Text size="xs" fw={600} c="dark.6" component="div" truncate>
                {hint}
              </Text>
              <IconArrowUpRight size={14} color="var(--mantine-color-gray-5)" />
            </Group>
          </Box>
        )}
      </Stack>
    </GlassCard>
  );

  return onClick ? (
    <UnstyledButton
      onClick={onClick}
      style={{ display: 'block', height: '100%', borderRadius: 20 }}
      aria-label={label}
    >
      {content}
    </UnstyledButton>
  ) : (
    content
  );
}
