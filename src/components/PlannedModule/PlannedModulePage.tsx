import { Box, Stack } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { PlannedModuleBody } from './PlannedModuleBody';

export interface PlannedModulePageProps {
  /** Key under `plannedModules.modules` in the translations. */
  moduleKey: string;
  icon: Icon;
}

/** A whole page for a module that is not open yet: the shared header, then the planned scope. */
export function PlannedModulePage({ moduleKey, icon }: Readonly<PlannedModulePageProps>) {
  const { t } = useTranslation('plannedModules');

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={icon}
            title={t(`modules.${moduleKey}.title`)}
            description={t(`modules.${moduleKey}.description`)}
          />
          <PlannedModuleBody moduleKey={moduleKey} />
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
