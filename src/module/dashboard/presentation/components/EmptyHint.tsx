import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

export function EmptyHint({ text }: Readonly<{ text: string }>) {
  return (
    <Stack align="center" gap="xs" py="xl">
      <ThemeIcon size={44} radius="xl" variant="light" color="gray">
        <IconInbox size={22} />
      </ThemeIcon>
      <Text size="sm" c="dimmed" ta="center">
        {text}
      </Text>
    </Stack>
  );
}
