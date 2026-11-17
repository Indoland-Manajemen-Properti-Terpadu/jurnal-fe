import { Box, SimpleGrid, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import {
  IconCalendarDue,
  IconFileCertificate,
  IconPackageImport,
  type Icon,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '@/module/assets/presentation/components/NeedsYou.module.css';

export type NeedsYouTile = {
  key: 'decisions' | 'pending' | 'depreciation';
  value: string;
  sub?: string;
  target: string;
};

const META: Record<NeedsYouTile['key'], { icon: Icon; color: string; label: string }> = {
  decisions: { icon: IconFileCertificate, color: 'primary', label: 'tileDecisions' },
  pending: { icon: IconPackageImport, color: 'yellow', label: 'tilePending' },
  depreciation: { icon: IconCalendarDue, color: 'secondary', label: 'tileDepreciation' },
};

/** Three counts at the top; each one jumps to its group below. */
export function NeedsYouTiles({ tiles }: Readonly<{ tiles: NeedsYouTile[] }>) {
  const { t } = useTranslation('assetWriteOffs');
  const jump = (target: string) =>
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <SimpleGrid
      component="ul"
      cols={{ base: 1, sm: 3 }}
      spacing="md"
      className={classes.tiles}
      aria-label={t('summaryLabel')}
    >
      {tiles.map((tile) => {
        const meta = META[tile.key];
        const TileIcon = meta.icon;
        return (
          <li key={tile.key}>
            <UnstyledButton
              className={classes.tile}
              onClick={() => jump(tile.target)}
              data-color={meta.color}
            >
              <ThemeIcon size={42} radius="md" variant="light" color={meta.color}>
                <TileIcon size={22} stroke={1.8} />
              </ThemeIcon>
              <Box miw={0}>
                <Text className={classes.tileValue}>{tile.value}</Text>
                <Text size="sm" fw={600} c="dark.8" lh={1.3}>
                  {t(meta.label)}
                </Text>
                {tile.sub && (
                  <Text size="xs" c="dimmed">
                    {tile.sub}
                  </Text>
                )}
              </Box>
            </UnstyledButton>
          </li>
        );
      })}
    </SimpleGrid>
  );
}

export default NeedsYouTiles;
