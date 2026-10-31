import React from 'react';
import { Alert, Group, Paper, Radio, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { AccessMemberSelects } from './AccessMemberSelects';

interface Option {
  value: string;
  label: string;
}

interface EditAccountAccessSectionProps {
  selectedAccountType: string;
  accessScope: string;
  setAccessScope: (value: string) => void;
  specialUsers: string[];
  setSpecialUsers: (value: string[]) => void;
  certainRoles: string[];
  setCertainRoles: (value: string[]) => void;
  userOptions: Option[];
  roleOptions: Option[];
  isLoadingUsers: boolean;
  isLoadingRoles: boolean;
}

/** Card 3: user access and authorization. */
export const EditAccountAccessSection: React.FC<EditAccountAccessSectionProps> = ({
  selectedAccountType,
  accessScope,
  setAccessScope,
  specialUsers,
  setSpecialUsers,
  certainRoles,
  setCertainRoles,
  userOptions,
  roleOptions,
  isLoadingUsers,
  isLoadingRoles,
}) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group gap="sm" mb="md">
        <ThemeIcon size={36} radius="md" variant="light" color="indigo">
          <IconShieldCheck size={20} />
        </ThemeIcon>
        <div>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('edit.accessTitle')}
          </Text>
          <Text fz="var(--jurnal-text-xs)" c="dimmed">
            {t('edit.accessSubtitle')}
          </Text>
        </div>
      </Group>

      <Stack gap="md">
        {selectedAccountType !== 'SingleAccount' ? (
          <Alert
            icon={<IconInfoCircle size={16} />}
            title={t('edit.centralTitle')}
            color="blue"
            radius="md"
          >
            {t('edit.centralPrefix')}{' '}
            <Text span fw={600}>
              {t('edit.centralStrong')}
            </Text>{' '}
            {t('edit.centralSuffix')}
          </Alert>
        ) : (
          <>
            <Radio.Group value={accessScope} onChange={setAccessScope}>
              <Group gap="xl">
                <Radio
                  value="AllUsers"
                  color="primary"
                  label={
                    <Text fz="var(--jurnal-text-sm)" fw={500} c="dark.8">
                      {t('edit.allUsers')}
                    </Text>
                  }
                />
                <Radio
                  value="SpecialUsers"
                  color="primary"
                  label={
                    <Text fz="var(--jurnal-text-sm)" fw={500} c="dark.8">
                      {t('edit.specialUsers')}
                    </Text>
                  }
                />
                <Radio
                  value="CertainRoles"
                  color="primary"
                  label={
                    <Text fz="var(--jurnal-text-sm)" fw={500} c="dark.8">
                      {t('edit.certainRoles')}
                    </Text>
                  }
                />
              </Group>
            </Radio.Group>

            <AccessMemberSelects
              accessScope={accessScope}
              usersLabel={t('edit.usersLabel')}
              usersPlaceholder={t('edit.usersPlaceholder')}
              rolesLabel={t('edit.rolesLabel')}
              rolesPlaceholder={t('edit.rolesPlaceholder')}
              userOptions={userOptions}
              roleOptions={roleOptions}
              specialUsers={specialUsers}
              certainRoles={certainRoles}
              onSpecialUsersChange={setSpecialUsers}
              onCertainRolesChange={setCertainRoles}
              isLoadingUsers={isLoadingUsers}
              isLoadingRoles={isLoadingRoles}
            />
          </>
        )}
      </Stack>
    </Paper>
  );
};
