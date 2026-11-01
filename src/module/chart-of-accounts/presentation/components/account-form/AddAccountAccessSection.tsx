import React from 'react';
import {
  Alert,
  Badge,
  Group,
  Paper,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconKey,
  IconShieldCheck,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { SYMMETRIC_INPUT_STYLES } from './accountFormStyles';
import { AccessMemberSelects } from './AccessMemberSelects';

interface Option {
  value: string;
  label: string;
}

interface AddAccountAccessSectionProps {
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

/** Section 3: user access and authorization. */
export const AddAccountAccessSection: React.FC<AddAccountAccessSectionProps> = ({
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
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="indigo">
            <IconShieldCheck size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
              {t('form.sec3Title')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('form.sec3Subtitle')}
            </Text>
          </div>
        </Group>
        <Badge variant="light" color="indigo" size="sm">
          {t('form.step3')}
        </Badge>
      </Group>

      <Stack gap="md">
        {selectedAccountType !== 'SingleAccount' ? (
          <Alert
            icon={<IconInfoCircle size={16} />}
            title={t('form.centralizedAccessTitle')}
            color="blue"
            radius="md"
          >
            {t('form.centralizedAccessDesc')}
          </Alert>
        ) : (
          <>
            {/* Symmetrical Equal-Height 3-Card Access Scope Selector */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              {[
                {
                  value: 'AllUsers',
                  title: t('form.accessAllTitle'),
                  desc: t('form.accessAllDesc'),
                  icon: IconUsers,
                },
                {
                  value: 'SpecialUsers',
                  title: t('form.accessUsersTitle'),
                  desc: t('form.accessUsersDesc'),
                  icon: IconUserCheck,
                },
                {
                  value: 'CertainRoles',
                  title: t('form.accessRolesTitle'),
                  desc: t('form.accessRolesDesc'),
                  icon: IconKey,
                },
              ].map((item) => {
                const active = accessScope === item.value;
                const ItemIcon = item.icon;
                return (
                  <Paper
                    key={item.value}
                    withBorder
                    radius="md"
                    p="sm"
                    h="100%"
                    onClick={() => setAccessScope(item.value)}
                    style={{
                      cursor: 'pointer',
                      borderColor: active ? themeColors.primary[6] : undefined,
                      backgroundColor: active ? 'var(--mantine-color-primary-0)' : 'white',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Group justify="space-between" align="flex-start" mb={6}>
                      <Radio
                        value={item.value}
                        checked={active}
                        onChange={() => setAccessScope(item.value)}
                        color="primary"
                      />
                      <ThemeIcon
                        size={26}
                        radius="md"
                        variant="light"
                        color={active ? 'primary' : 'gray'}
                      >
                        <ItemIcon size={15} />
                      </ThemeIcon>
                    </Group>
                    <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
                      {item.title}
                    </Text>
                    <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={3} lh={1.35}>
                      {item.desc}
                    </Text>
                  </Paper>
                );
              })}
            </SimpleGrid>

            <AccessMemberSelects
              accessScope={accessScope}
              usersLabel={t('form.selectUsersLabel')}
              usersPlaceholder={t('form.selectUsersPlaceholder')}
              rolesLabel={t('form.selectRolesLabel')}
              rolesPlaceholder={t('form.selectRolesPlaceholder')}
              userOptions={userOptions}
              roleOptions={roleOptions}
              specialUsers={specialUsers}
              certainRoles={certainRoles}
              onSpecialUsersChange={setSpecialUsers}
              onCertainRolesChange={setCertainRoles}
              isLoadingUsers={isLoadingUsers}
              isLoadingRoles={isLoadingRoles}
              labelStyles={{ label: SYMMETRIC_INPUT_STYLES.label }}
            />
          </>
        )}
      </Stack>
    </Paper>
  );
};
