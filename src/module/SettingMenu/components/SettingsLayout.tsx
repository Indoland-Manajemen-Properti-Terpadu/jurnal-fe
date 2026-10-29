import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconSettings } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { settingsGroups } from '../settingsNavigation';
import classes from './SettingsLayout.module.css';

type SettingsLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function SettingsLayout({
  children,
  title,
  description,
  action,
}: Readonly<SettingsLayoutProps>) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation('settings');
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = settingsGroups
    .flatMap((group) => group.items)
    .find(
      (item) =>
        item.path &&
        (item.path === '/settings' ? pathname === item.path : pathname.startsWith(item.path))
    );

  const navigation = (
    <nav aria-label={t('navigationLabel')}>
      <Stack gap="md">
        {settingsGroups.map((group) => (
          <Box key={group.key}>
            <Text className={classes.groupLabel}>{t(`group.${group.key}`)}</Text>
            <Stack gap={2}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const { path } = item;
                const active = path !== undefined && path === activeItem?.path;
                return path ? (
                  <UnstyledButton
                    key={item.key}
                    className={classes.link}
                    data-active={active || undefined}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => {
                      navigate(path);
                      setMobileOpen(false);
                    }}
                  >
                    <Icon size={18} stroke={1.8} aria-hidden="true" />
                    <span>{t(`item.${item.key}`)}</span>
                  </UnstyledButton>
                ) : (
                  <div key={item.key} className={classes.unavailable} title={t('notAvailable')}>
                    <Icon size={18} stroke={1.8} aria-hidden="true" />
                    <span>{t(`item.${item.key}`)}</span>
                  </div>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
    </nav>
  );

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconSettings}
            title={title}
            description={description}
            actions={action}
          />
          <div className={classes.layout}>
            <Paper withBorder radius="lg" className={classes.sidebar}>
              <ScrollArea h="calc(100vh - 210px)" offsetScrollbars>
                {navigation}
              </ScrollArea>
            </Paper>
            <Box className={classes.content}>
              <Button
                className={classes.mobileToggle}
                variant="default"
                fullWidth
                justify="space-between"
                rightSection={<IconChevronDown size={16} />}
                onClick={() => setMobileOpen((open) => !open)}
                aria-expanded={mobileOpen}
              >
                {activeItem ? t(`item.${activeItem.key}`) : t('navigationLabel')}
              </Button>
              {mobileOpen && (
                <Paper withBorder radius="md" p="md" className={classes.mobileNavigation}>
                  {navigation}
                </Paper>
              )}
              {children}
            </Box>
          </div>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
