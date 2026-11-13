import { ActionIcon, Box, Group, Image, Paper, Popover, Stack, Text, Tooltip } from '@mantine/core';
import { ArrowUpRight, DotsNine } from '@phosphor-icons/react';
import { capitalize } from 'lodash';
import { APP_CATALOG, type AppEntry } from '@/constants/apps';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/store/useAuthentications';
import classes from '@/components/AppSwitcher/AppSwitcher.module.css';

/** The logo of an app, in a rounded square the same size everywhere. */
function AppMark({ app }: Readonly<{ app: AppEntry }>) {
  return (
    <Image src={app.logo} alt="" w={44} h={44} radius={12} fit="cover" style={{ flex: 'none' }} />
  );
}

/** Opens from one icon in the header: who and where you are, the app in use, and the other apps of the family. */
export function AppSwitcher() {
  const { t } = useTranslation('navigation');
  const userName = useAuthStore((state) => state.userName);

  const key = (app: AppEntry, part: 'Name' | 'Desc') => `app${capitalize(app.id)}${part}`;
  const current = APP_CATALOG.filter((app) => app.current);
  const others = APP_CATALOG.filter((app) => !app.current);

  return (
    <Popover width={360} position="bottom-end" shadow="lg" radius="lg" trapFocus returnFocus>
      <Popover.Target>
        <Tooltip label={t('apps')} withArrow>
          <ActionIcon size={36} radius="md" variant="default" aria-label={t('apps')}>
            <DotsNine size={22} weight="bold" />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p="md">
        <Stack gap="md">
          <Box>
            <Text fw={700} fz="md" c="dark.9">
              {t('appsGreeting', { name: capitalize(userName || '') })}
            </Text>
            <Text fz="sm" c="dimmed">
              {t('appsSubtitle')}
            </Text>
          </Box>

          {current.map((app) => (
            <Paper
              key={app.id}
              data-app={app.id}
              withBorder
              radius="md"
              p="md"
              bg={`${app.color}.0`}
              style={{ borderColor: `var(--mantine-color-${app.color}-2)` }}
            >
              <Group gap="md" wrap="nowrap">
                <AppMark app={app} />
                <Box style={{ minWidth: 0 }}>
                  <Text fw={700} fz="sm" c="dark.9">
                    {t(key(app, 'Name'))}
                  </Text>
                  <Text fz={12} c="dimmed">
                    {t(key(app, 'Desc'))}
                  </Text>
                </Box>
                <Text
                  fz={12}
                  fw={600}
                  c={`${app.color}.8`}
                  ml="auto"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t('appsInUse')}
                </Text>
              </Group>
            </Paper>
          ))}

          {others.length > 0 && (
            <Stack gap="xs">
              <Text fz={12} fw={600} tt="uppercase" lts={0.6} c="dimmed">
                {t('appsOthers')}
              </Text>
              <Stack gap="sm">
                {others.map((app) => (
                  <Paper
                    key={app.id}
                    component="a"
                    data-app={app.id}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('appsOpenNewTab', { name: t(key(app, 'Name')) })}
                    withBorder
                    p="md"
                    bg="white"
                    className={classes.tile}
                  >
                    <Group gap="md" wrap="nowrap">
                      <AppMark app={app} />
                      <Box style={{ minWidth: 0 }}>
                        <Text fw={700} fz="sm" c="dark.9">
                          {t(key(app, 'Name'))}
                        </Text>
                        <Text fz={12} c="dimmed">
                          {t(key(app, 'Desc'))}
                        </Text>
                      </Box>
                    </Group>
                    <ArrowUpRight
                      className={classes.arrow}
                      size={16}
                      weight="bold"
                      aria-hidden="true"
                    />
                  </Paper>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
