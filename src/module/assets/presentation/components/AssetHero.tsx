import type { ReactNode } from 'react';
import { Box, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import {
  AssetIllustration,
  type AssetIllustrationName,
} from '@/module/assets/presentation/components/AssetIllustration';

export type AssetHeroProps = {
  title: string;
  body: string;
  /** Short promises with a tick each, as on the closing-books and bank-connection pages. */
  points?: string[];
  actions?: ReactNode;
  illustration: AssetIllustrationName;
  /** Width of the drawing; the wide ones are 420, a stamp or a small scene about 200. */
  artWidth?: number;
  /** A status banner: the drawing sits beside the text instead of filling the right half. */
  compact?: boolean;
};

/** The intro card of a screen: what this is for in a headline and a few lines, with a drawing. */
export function AssetHero({
  title,
  body,
  points,
  actions,
  illustration,
  artWidth = 420,
  compact,
}: Readonly<AssetHeroProps>) {
  if (compact) {
    return (
      <Paper withBorder radius="md" p={{ base: 'md', sm: 'lg' }} bg="white">
        <Group gap="xl" wrap="nowrap" align="center">
          <Box w={artWidth} style={{ flex: 'none' }} visibleFrom="sm">
            <AssetIllustration name={illustration} maxWidth={artWidth} />
          </Box>
          <Stack gap={4} miw={0}>
            <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
              {title}
            </Text>
            <Text c="dimmed" maw="62ch">
              {body}
            </Text>
            {actions}
          </Stack>
        </Group>
      </Paper>
    );
  }
  return (
    <Paper withBorder radius="md" p={{ base: 'lg', sm: 'xl' }} bg="white">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
        <Stack gap="md">
          <Stack gap="xs">
            <Text component="h2" fz={20} fw={700} c="dark.9" m={0}>
              {title}
            </Text>
            <Text c="dimmed" maw="52ch">
              {body}
            </Text>
          </Stack>
          {points && points.length > 0 && (
            <Stack gap={8} component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
              {points.map((point) => (
                <Group key={point} component="li" gap="xs" wrap="nowrap">
                  <ThemeIcon size={20} radius="xl" variant="light" color="teal" aria-hidden="true">
                    <IconCheck size={12} stroke={3} />
                  </ThemeIcon>
                  <Text fz="sm" c="dark.9">
                    {point}
                  </Text>
                </Group>
              ))}
            </Stack>
          )}
          {actions}
        </Stack>
        <Stack align="center">
          <AssetIllustration name={illustration} maxWidth={artWidth} />
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}

export default AssetHero;
