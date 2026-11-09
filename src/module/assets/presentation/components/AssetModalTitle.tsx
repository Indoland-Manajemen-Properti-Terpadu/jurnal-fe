import { Box, Group, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

/** Icon orb, title and subtitle shared by the asset dialogs. */
export function AssetModalTitle({
  icon: TitleIcon,
  title,
  subtitle,
}: Readonly<{ icon: Icon; title: string; subtitle: string }>) {
  return (
    <Group gap="sm" align="center" wrap="nowrap">
      <ThemeIcon size={36} radius="md" variant="light" color="primary">
        <TitleIcon size={20} stroke={1.8} />
      </ThemeIcon>
      <Box>
        <Text fw={700} size="md" c="dark.9" lh={1.2}>
          {title}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {subtitle}
        </Text>
      </Box>
    </Group>
  );
}

export default AssetModalTitle;
