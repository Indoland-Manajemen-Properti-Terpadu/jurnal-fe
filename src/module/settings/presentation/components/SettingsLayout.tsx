import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Stack } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import type { Crumb } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { findSettingsEntry } from '@/components/Navbar/settingsMenu';

type SettingsLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Page frame for every settings screen. Navigation lives in the app sidebar sub-menus. */
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
  if (entry && entry.group.items.length > 1) {
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
          <Box w="100%">{children}</Box>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
