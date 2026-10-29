import { Center, Loader, Stack, Tabs, Text } from '@mantine/core';
import {
  IconBuilding,
  IconKey,
  IconShieldLock,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { PersonalInfoTab } from '../components/PersonalInfoTab';
import { ProfileHero } from '../components/ProfileHero';
import { RolesTab } from '../components/RolesTab';
import { SecurityTab } from '../components/SecurityTab';
import { SiteTab } from '../components/SiteTab';
import { useGetProfile, useUpdateProfile } from '../hooks/useProfileQueries';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const { data: user, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  if (isLoading) {
    return (
      <AppShellLayout>
        <Center h={450}>
          <Stack align="center" gap="sm">
            <Loader size="lg" color="primary.6" type="dots" />
            <Text size="sm" c="dimmed">
              {t('loading')}
            </Text>
          </Stack>
        </Center>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <Stack gap="lg" pb="xl">
        <ModuleHeader
          icon={IconUserCircle}
          title={t('header.title')}
          description={t('header.description')}
          breadcrumbs={[
            { label: t('header.home'), to: '/dashboard' },
            { label: t('header.title') },
          ]}
        />

        <ProfileHero user={user} />

        <Tabs defaultValue="personal" radius="md" color="primary">
          <Tabs.List>
            <Tabs.Tab value="personal" leftSection={<IconUser size={16} />}>
              {t('tabs.personal')}
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShieldLock size={16} />}>
              {t('tabs.security')}
            </Tabs.Tab>
            <Tabs.Tab value="roles" leftSection={<IconKey size={16} />}>
              {t('tabs.roles')}
            </Tabs.Tab>
            <Tabs.Tab value="site" leftSection={<IconBuilding size={16} />}>
              {t('tabs.site')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="personal" pt="md">
            <PersonalInfoTab
              user={user}
              isSaving={updateProfile.isPending}
              onSubmit={(input) => updateProfile.mutate(input)}
            />
          </Tabs.Panel>

          <Tabs.Panel value="security" pt="md">
            <SecurityTab
              user={user}
              isSaving={updateProfile.isPending}
              onSubmit={(input, onSuccess) => updateProfile.mutate(input, { onSuccess })}
            />
          </Tabs.Panel>

          <Tabs.Panel value="roles" pt="md">
            <RolesTab user={user} />
          </Tabs.Panel>

          <Tabs.Panel value="site" pt="md">
            <SiteTab user={user} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </AppShellLayout>
  );
}
