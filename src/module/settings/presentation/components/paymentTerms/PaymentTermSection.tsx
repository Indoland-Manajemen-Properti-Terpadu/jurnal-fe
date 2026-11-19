import type { ReactNode } from 'react';
import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

type Props = { icon: Icon; title: string; subtitle?: string; children: ReactNode };

/** One topic of the form in its own card: icon tile, bold title and a dimmed subtitle. */
export function PaymentTermSection({
  icon: SectionIcon,
  title,
  subtitle,
  children,
}: Readonly<Props>) {
  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} shadow="none" bg="white">
      <Group gap="sm" wrap="nowrap" align="flex-start" mb="lg">
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
      {children}
    </Paper>
  );
}

export default PaymentTermSection;
