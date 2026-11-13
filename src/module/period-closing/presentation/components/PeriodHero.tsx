import { Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { PeriodIllustration } from './PeriodIllustration';

const POINTS = ['protect', 'journal', 'reopen'] as const;

/** What closing the books does for the user, in one picture and three promises. */
export function PeriodHero() {
  const { t } = useTranslation('periodClosing');

  return (
    <Paper withBorder radius="md" p="xl" bg="white">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
        <Stack gap="md">
          <Stack gap="xs">
            <Text component="h2" fz={20} fw={700} c="dark.9" m={0}>
              {t('hero.title')}
            </Text>
            <Text c="dimmed" maw="52ch">
              {t('hero.body')}
            </Text>
          </Stack>
          <Stack gap={8} component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
            {POINTS.map((point) => (
              <Group key={point} component="li" gap="xs" wrap="nowrap">
                <ThemeIcon size={20} radius="xl" variant="light" color="teal" aria-hidden="true">
                  <IconCheck size={12} stroke={3} />
                </ThemeIcon>
                <Text fz="sm" c="dark.9">
                  {t(`hero.points.${point}`)}
                </Text>
              </Group>
            ))}
          </Stack>
        </Stack>
        <PeriodIllustration name="hero" maxWidth={420} />
      </SimpleGrid>
    </Paper>
  );
}
