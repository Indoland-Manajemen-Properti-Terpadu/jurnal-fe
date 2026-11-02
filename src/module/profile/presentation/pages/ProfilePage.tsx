import { Box, Paper, Skeleton, Stack, Tabs } from '@mantine/core';
import { IconShieldLock, IconUser, IconUserCircle, IconKey } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { canEditOwnDetails } from '../../domain/access';
import { AccessTab } from '../components/AccessTab';
import { AccountTab } from '../components/AccountTab';
import { IdentityCard } from '../components/IdentityCard';
import { SecurityTab } from '../components/SecurityTab';
import { useGetProfile, useMyAccess, useUpdateProfile } from '../hooks/useProfileQueries';

export default function ProfilePage() {
  const { t } = useTranslation('profile');
  const profile = useGetProfile();
  const access = useMyAccess();
  const updateProfile = useUpdateProfile();
  const user = profile.data;

  let body;
  if (profile.isError) {
    body = (
      <Paper withBorder radius="lg" bg="white">
        <EmptyState
          title={t('error.title')}
          description={t('error.description')}
          actionLabel={t('error.retry')}
          onAction={() => profile.refetch()}
          color="red"
        />
      </Paper>
    );
  } else if (!user) {
    body = (
      <Stack gap="lg">
        <Skeleton height={132} radius="lg" aria-busy="true" />
        <Skeleton height={340} radius="lg" />
      </Stack>
    );
  } else {
    body = (
      <Stack gap="lg">
        <IdentityCard user={user} />

        <Paper withBorder radius="lg" p="md" bg="white">
          <Tabs
            defaultValue="account"
            color="primary"
            variant="pills"
            radius="md"
            keepMounted={false}
          >
            <Tabs.List
              mb="md"
              pb={12}
              style={{
                gap: 4,
                borderBottom: '1px solid var(--mantine-color-gray-2)',
              }}
            >
              <Tabs.Tab value="account" leftSection={<IconUser size={16} />}>
                {t('tabs.account')}
              </Tabs.Tab>
              <Tabs.Tab value="security" leftSection={<IconKey size={16} />}>
                {t('tabs.security')}
              </Tabs.Tab>
              <Tabs.Tab value="access" leftSection={<IconShieldLock size={16} />}>
                {t('tabs.access')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="account">
              <AccountTab
                user={user}
                canEdit={canEditOwnDetails(access.data)}
                isSaving={updateProfile.isPending}
                onSubmit={(input) => updateProfile.mutate(input)}
              />
            </Tabs.Panel>
            <Tabs.Panel value="security">
              <SecurityTab />
            </Tabs.Panel>
            <Tabs.Panel value="access">
              {access.data ? (
                <AccessTab user={user} access={access.data} />
              ) : (
                <Skeleton height={240} radius="md" />
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    );
  }

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconUserCircle}
            title={t('header.title')}
            description={t('header.description')}
            breadcrumbs={[
              { label: t('header.home'), to: routes.dashboard },
              { label: t('header.title') },
            ]}
          />
          {body}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
