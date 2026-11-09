import type { ReactNode } from 'react';
import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import classes from './AssetDetail.module.css';

export type AssetSectionCardProps = {
  icon: Icon;
  title: string;
  subtitle?: string;
  /** Aligned to the right of the heading. */
  right?: ReactNode;
  children: ReactNode;
};

/** A detail card: icon orb, bold title and a dimmed subtitle, then its content. */
export function AssetSectionCard({
  icon: SectionIcon,
  title,
  subtitle,
  right,
  children,
}: Readonly<AssetSectionCardProps>) {
  return (
    <Paper withBorder radius="lg" p="md" bg="white" h="100%">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md" gap="sm">
        <Group gap="sm" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <SectionIcon size={18} stroke={1.8} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Text fw={700} fz={15} c="dark.9" lh={1.3}>
              {title}
            </Text>
            {subtitle && (
              <Text fz={12} c="dimmed" lh={1.4}>
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
        {right}
      </Group>
      {children}
    </Paper>
  );
}

/** One label and value of a definition list; rows are separated by a hairline. */
export function AssetInfoRow({
  label,
  children,
  muted,
}: Readonly<{ label: string; children: ReactNode; muted?: boolean }>) {
  return (
    <div className={classes.row}>
      <span className={classes.rowLabel}>{label}</span>
      <span className={classes.rowValue} data-muted={muted}>
        {children}
      </span>
    </div>
  );
}

export default AssetSectionCard;
