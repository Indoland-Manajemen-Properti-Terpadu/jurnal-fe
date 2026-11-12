import { Paper, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

/** Three short answers beside the form, closed except the first: why the data is asked, what is seen, how to stop. */
export function FormAside() {
  const { t } = useTranslation('bankConnection');
  return (
    <Stack gap="sm">
      {(['Why', 'See', 'Stop'] as const).map((key) => (
        <Paper
          key={key}
          component="details"
          withBorder
          radius="md"
          p="md"
          bg="white"
          open={key === 'Why'}
        >
          <Text component="summary" fw={600} fz="sm" style={{ cursor: 'pointer' }}>
            {t(`form.aside${key}Title`)}
          </Text>
          <Text fz="sm" c="dimmed" mt="xs">
            {t(`form.aside${key}Body`)}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
}
