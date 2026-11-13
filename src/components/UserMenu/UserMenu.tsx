import { Avatar, Box, Group, Menu, SegmentedControl, Text, UnstyledButton } from '@mantine/core';
import {
  ArrowUpRight,
  CaretDown,
  Gear,
  Question,
  SignOut,
  Translate,
  UserCircle,
} from '@phosphor-icons/react';
import { capitalize } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { AVAILABLE_LANGUAGES, useTranslation, type SupportedLanguage } from '@/i18n';
import { useAuthStore } from '@/store/useAuthentications';
import { useSessionProfile } from '@/components/UserMenu/useSessionProfile';
import classes from '@/components/UserMenu/UserMenu.module.css';

/** Where the help lives: the ProApps site, opened in a new tab. */
const HELP_URL = 'https://proapps.id';

/**
 * The menu of the signed-in person. The button names them and their company; the card opens with who
 * they are (name, email, role), the company they work in with its id, then the two things to do:
 * open the profile, or sign out.
 */
export function UserMenu() {
  const { t, i18n, currentLanguage } = useTranslation('navigation');
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
      width={304}
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

      <Menu.Dropdown p={0} className={classes.dropdown}>
        <Group className={classes.identity} gap="md" wrap="nowrap" align="center">
          <Avatar className={classes.avatar} size={48} radius="xl" color="primary" variant="filled">
            {initials}
          </Avatar>
          <Box className={classes.who}>
            <Text className={classes.name} truncate>
              {name}
            </Text>
            {profile?.email && (
              <Text className={classes.email} truncate>
                {profile.email}
              </Text>
            )}
          </Box>
        </Group>

        <Box className={classes.actions}>
          <Menu.Item
            className={classes.action}
            leftSection={<UserCircle size={20} />}
            onClick={() => navigate(routes.profile)}
          >
            {t('profile')}
          </Menu.Item>
          <Menu.Item
            className={classes.action}
            leftSection={<Gear size={20} />}
            onClick={() => navigate(routes.settings.main)}
          >
            {t('settings')}
          </Menu.Item>

          <Box className={classes.languageRow}>
            <Translate size={20} aria-hidden="true" />
            <Text className={classes.languageLabel}>{t('userLanguage')}</Text>
            <SegmentedControl
              size="xs"
              radius="md"
              aria-label={t('userLanguage')}
              value={currentLanguage}
              onChange={(code) => i18n.changeLanguage(code as SupportedLanguage)}
              data={AVAILABLE_LANGUAGES.map((item) => ({
                value: item.code,
                label: item.code.toUpperCase(),
              }))}
            />
          </Box>

          <Menu.Item
            className={classes.action}
            component="a"
            href={HELP_URL}
            target="_blank"
            rel="noopener noreferrer"
            leftSection={<Question size={20} />}
            rightSection={<ArrowUpRight size={14} />}
          >
            {t('userHelp')}
          </Menu.Item>

          <Menu.Divider className={classes.divider} />

          <Menu.Item
            className={classes.action}
            leftSection={<SignOut size={20} />}
            onClick={signOut}
          >
            {t('logout')}
          </Menu.Item>
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}
