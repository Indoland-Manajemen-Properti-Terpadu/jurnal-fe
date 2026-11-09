import { Box, Paper, Select, Stack, Text, UnstyledButton } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { findSettingsEntry, visibleSettingsGroups } from '@/components/Navbar/settingsMenu';
import { useNavigationAccess } from '@/components/Navbar/useNavigationAccess';
import classes from './SettingsNav.module.css';

/** Side menu of the settings area: every settings page in its category, on desktop; a select on a phone. */
export default function SettingsNav() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const groups = visibleSettingsGroups(useNavigationAccess());
  const active = findSettingsEntry(pathname)?.item;

  const options = groups.map((group) => ({
    group: t(`group.${group.key}`),
    items: group.items.map((item) => ({
      value: item.key,
      label: t(`item.${item.key}`),
    })),
  }));
  const pathOf = (key: string) =>
    groups.flatMap((group) => group.items).find((item) => item.key === key)?.path;

  return (
    <>
      <Select
        hiddenFrom="md"
        aria-label={t('nav.title')}
        data={options}
        value={active?.key ?? null}
        allowDeselect={false}
        onChange={(key) => {
          const path = key ? pathOf(key) : undefined;
          if (path) navigate(path);
        }}
      />
      <Paper withBorder radius="lg" p="xs" bg="white" visibleFrom="md" className={classes.panel}>
        <nav aria-label={t('nav.title')}>
          <Stack gap="md">
            {groups.map((group) => (
              <Box key={group.key}>
                <Text className={classes.groupLabel}>{t(`group.${group.key}`)}</Text>
                <Stack gap={2}>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = active?.key === item.key;
                    return (
                      <UnstyledButton
                        key={item.key}
                        className={classes.item}
                        data-active={isActive || undefined}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => navigate(item.path)}
                      >
                        <ItemIcon size={18} stroke={1.8} aria-hidden />
                        <span className={classes.label}>{t(`item.${item.key}`)}</span>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </nav>
      </Paper>
    </>
  );
}
