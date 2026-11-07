import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Grid, Stack } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import type { Crumb } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { findSettingsEntry } from '@/components/Navbar/settingsMenu';
import SettingsNav from './SettingsNav';

type SettingsLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Page frame for every settings screen: the header, the settings side menu and the page content. */
export default function SettingsLayout({
  children,
  title,
  description,
  action,
}: Readonly<SettingsLayoutProps>) {
  const { pathname } = useLocation();
  const { t } = useTranslation('settings');

  const entry = findSettingsEntry(pathname);
  const breadcrumbs: Crumb[] = [{ label: t('breadcrumbRoot') }];
  if (entry) {
    breadcrumbs.push({ label: t(`group.${entry.group.key}`) });
  }

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={entry?.item.icon ?? IconSettings}
            title={title}
            description={description}
            actions={action}
          />
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, md: 3 }}>
              <SettingsNav />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 9 }}>
              <Box w="100%">{children}</Box>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
