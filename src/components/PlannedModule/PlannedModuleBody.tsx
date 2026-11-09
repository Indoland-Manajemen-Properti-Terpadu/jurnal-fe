import { Box, Button, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCircleCheck, IconHourglassEmpty } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

const FEATURE_KEYS = ['one', 'two', 'three', 'four'] as const;

export interface PlannedModuleBodyProps {
  /** Key under `plannedModules.modules` in the translations. */
  moduleKey: string;
}

/**
 * Content of a module whose menu exists but whose features are not open yet: what it is for and the
 * planned scope. Every such module uses this, so the empty ones all look the same.
 */
export function PlannedModuleBody({ moduleKey }: Readonly<PlannedModuleBodyProps>) {
  const { t } = useTranslation('plannedModules');
  const navigate = useNavigate();
  const base = `modules.${moduleKey}`;

  return (
    <Paper withBorder radius="lg" p={{ base: 'lg', sm: 'xl' }} bg="white">
      <Stack gap="xl">
        <Stack align="center" gap="xs" ta="center" py="md">
          <ThemeIcon size={64} radius="xl" variant="light" color="primary">
            <IconHourglassEmpty size={30} stroke={1.6} />
          </ThemeIcon>
          <Title order={3} fz={18}>
            {t('common.title')}
          </Title>
          <Text c="dimmed" maw={520} size="sm">
            {t('common.subtitle')}
          </Text>
          <Button variant="default" mt="xs" onClick={() => navigate(routes.dashboard)}>
            {t('common.backToDashboard')}
          </Button>
        </Stack>

        <Box>
          <Text size="xs" fw={700} tt="uppercase" lts="0.06em" c="dimmed" mb="sm">
            {t('common.featuresTitle')}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {FEATURE_KEYS.map((key) => {
              const label = t(`${base}.features.${key}`);
              return (
                <Paper key={key} withBorder radius="md" p="md" bg="gray.0">
                  <Box style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <IconCircleCheck
                      size={18}
                      stroke={1.8}
                      color="var(--mantine-color-primary-6)"
                      aria-hidden
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <Text size="sm">{label}</Text>
                  </Box>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Box>
      </Stack>
    </Paper>
  );
}
