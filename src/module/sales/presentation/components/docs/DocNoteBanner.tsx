import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconCircleCheck, IconInfoCircle } from '@tabler/icons-react';

export type NoteTone = 'green' | 'blue' | 'gray';

const TONES: Record<NoteTone, { bg: string; fg: string; icon: typeof IconInfoCircle }> = {
  green: { bg: 'green.1', fg: 'green.9', icon: IconCircleCheck },
  blue: { bg: 'primary.0', fg: 'primary.8', icon: IconInfoCircle },
  gray: { bg: 'gray.1', fg: 'gray.8', icon: IconInfoCircle },
};

/** The one sentence that says where a document stands; green only for a good outcome. */
export function DocNoteBanner({
  tone,
  text,
  radius = 'md',
}: Readonly<{ tone: NoteTone; text: string; radius?: 'md' | 'lg' }>) {
  const { bg, fg, icon: ToneIcon } = TONES[tone];
  return (
    <Paper radius={radius} px="md" py="sm" bg={bg}>
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={22}
          radius="xl"
          color={tone === 'green' ? 'green' : 'gray'}
          variant="transparent"
        >
          <ToneIcon size={20} />
        </ThemeIcon>
        <Text size="sm" c={fg}>
          {text}
        </Text>
      </Group>
    </Paper>
  );
}
