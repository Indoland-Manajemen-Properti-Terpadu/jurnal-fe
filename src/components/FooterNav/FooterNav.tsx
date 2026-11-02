import { Group, Text } from '@mantine/core';

export const FooterNav = () => (
  <Group align="center" h="100%">
    <Text size="xs" c="dimmed">
      &copy; {new Date().getFullYear()}{' '}
      <Text span fw={600}>
        ProApps
      </Text>{' '}
      · Jurnal Accounting
    </Text>
  </Group>
);
