import { Avatar, Badge, Box, Group, Menu, Stack, Text, UnstyledButton } from '@mantine/core';
import { Buildings, CaretDown, SignOut, UserCircle } from '@phosphor-icons/react';
import { capitalize } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/store/useAuthentications';
import { useSessionProfile } from '@/components/UserMenu/useSessionProfile';
import classes from '@/components/UserMenu/UserMenu.module.css';

/**
 * The menu of the signed-in person. The button names them and their company; the card opens with who
 * they are (name, email, role), the company they work in with its id, then the two things to do:
 * open the profile, or sign out.
 */
export function UserMenu() {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const userName = useAuthStore((state) => state.userName);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const { data: profile } = useSessionProfile();

  const name = profile?.name || capitalize(userName || '');
  const initials = profile?.initials || name.slice(0, 1).toUpperCase();
  const site = profile?.site;

  const signOut = () => {
    clearTokens();
    navigate(routes.login);
  };

  return (
    <Menu
      shadow="lg"
      width={320}
      radius="lg"
      position="bottom-end"
      transitionProps={{ duration: 0 }}
    >
      <Menu.Target>
        <UnstyledButton className={classes.trigger} aria-label={t('userMenu')}>
          <Group gap={10} wrap="nowrap">
            <Avatar size={34} radius="xl" variant="light" color="primary">
              {initials}
            </Avatar>
            <Box visibleFrom="sm" style={{ minWidth: 0 }}>
              <Text fz="var(--jurnal-text-sm)" fw={700} c="dark.8" lh={1.15} truncate maw={150}>
                {name}
              </Text>
              {site && (
                <Text fz={12} c="dimmed" lh={1.15} truncate maw={150}>
                  {site.name}
                </Text>
              )}
            </Box>
            <CaretDown size={14} weight="bold" color="var(--mantine-color-gray-5)" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p={0} style={{ overflow: 'hidden' }}>
        <Group className={classes.identity} gap="md" p="md" wrap="nowrap" align="center">
          <Box className={classes.avatarRing}>
            <Avatar size={52} radius="xl" color="primary" variant="filled">
              {initials}
            </Avatar>
          </Box>
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text fw={700} fz="md" c="dark.9" lh={1.2} truncate>
              {name}
            </Text>
            {profile?.email && (
              <Text fz="sm" c="dimmed" truncate>
                {profile.email}
              </Text>
            )}
            {profile?.role && (
              <Badge variant="light" size="sm" radius="sm" w="fit-content" tt="none">
                {profile.role}
              </Badge>
            )}
          </Stack>
        </Group>

        {site && (
          <Box p="md" pb={0}>
            <Group className={classes.company} gap="sm" p="sm" wrap="nowrap">
              <Box
                aria-hidden="true"
                w={36}
                h={36}
                bg="primary.0"
                style={{ borderRadius: 10, display: 'grid', placeItems: 'center', flex: 'none' }}
              >
                <Buildings size={20} weight="duotone" color="var(--mantine-color-primary-8)" />
              </Box>
              <Box style={{ minWidth: 0 }}>
                <Text fz="sm" fw={600} c="dark.9" truncate>
                  {site.name}
                </Text>
                {site.code && (
                  <Text className={classes.code} fz={12} c="dimmed">
                    {t('userSiteId', { code: site.code })}
                  </Text>
                )}
              </Box>
            </Group>
          </Box>
        )}

        <Box p="xs" mt="xs">
          <Menu.Item
            leftSection={<UserCircle size={18} weight="duotone" />}
            onClick={() => navigate(routes.profile)}
          >
            {t('profile')}
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<SignOut size={18} weight="duotone" />}
            onClick={signOut}
          >
            {t('logout')}
          </Menu.Item>
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}
