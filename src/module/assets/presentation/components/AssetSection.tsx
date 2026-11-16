import type { ReactNode } from 'react';
import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

export type AssetSectionHeadingProps = {
  icon: Icon;
  title: string;
  subtitle?: string;
  /** Aligned to the right of the heading. */
  right?: ReactNode;
};

/** Icon tile, bold title and a dimmed subtitle, as on the contact detail page. */
export function AssetSectionHeading({
  icon: SectionIcon,
  title,
  subtitle,
  right,
}: Readonly<AssetSectionHeadingProps>) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" mb="lg" gap="sm">
      <Group gap="sm" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
        <ThemeIcon size={38} radius="md" variant="light" color="primary">
          <SectionIcon size={20} stroke={1.8} />
        </ThemeIcon>
        <Box style={{ minWidth: 0 }}>
          <Text fw={700} fz="md" c="dark.9">
            {title}
          </Text>
          {subtitle && (
            <Text fz="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Box>
      </Group>
      {right}
    </Group>
  );
}

export type AssetCardProps = AssetSectionHeadingProps & { children: ReactNode };

/** One topic of the detail page in its own card, like the cards of the contact detail. */
export function AssetCard({ children, ...heading }: Readonly<AssetCardProps>) {
  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} shadow="none" bg="white">
      <AssetSectionHeading {...heading} />
      {children}
    </Paper>
  );
}

export default AssetCard;
