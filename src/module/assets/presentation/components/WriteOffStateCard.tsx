import type { ReactNode } from 'react';
import { Paper, Stack, Text } from '@mantine/core';
import {
  AssetIllustration,
  type AssetIllustrationName,
} from '@/module/assets/presentation/components/AssetIllustration';

export type WriteOffStateCardProps = {
  illustration: AssetIllustrationName;
  title: string;
  body: ReactNode;
  action?: ReactNode;
};

/** A calm full-width message with a drawing: not found, cannot be filed, already pending, all done. */
export function WriteOffStateCard({
  illustration,
  title,
  body,
  action,
}: Readonly<WriteOffStateCardProps>) {
  return (
    <Paper withBorder radius="lg" p={{ base: 'lg', sm: 'xl' }} bg="white">
      <Stack align="center" gap="sm" ta="center" maw={520} mx="auto">
        <AssetIllustration name={illustration} maxWidth={150} />
        <Text fw={700} fz="lg">
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {body}
        </Text>
        {action}
      </Stack>
    </Paper>
  );
}

export default WriteOffStateCard;
