import React from 'react';
import { Alert, Group, Paper, Radio, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle, IconShieldCheck } from '@tabler/icons-react';
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
}) => (
  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
    <Group gap="sm" mb="md">
      <ThemeIcon size={36} radius="md" variant="light" color="indigo">
        <IconShieldCheck size={20} />
      </ThemeIcon>
      <div>
        <Text fw={700} fz={15} c="dark.8">
          Hak Akses & Otorisasi Pengguna
        </Text>
        <Text fz={12} c="dimmed">
          Atur batasan pengguna atau peran yang dapat melihat akun ini
        </Text>
      </div>
    </Group>

    <Stack gap="md">
      {selectedAccountType !== 'SingleAccount' ? (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Otorisasi Terpusat"
          color="blue"
          radius="md"
        >
          Akses untuk Akun Induk dan Sub Akun otomatis disetel ke{' '}
          <Text span fw={600}>
            Semua Pengguna
          </Text>{' '}
          untuk menjamin konsistensi laporan keuangan dan buku besar.
        </Alert>
      ) : (
        <>
          <Radio.Group value={accessScope} onChange={setAccessScope}>
            <Group gap="xl">
              <Radio
                value="AllUsers"
                color="primary"
                label={
                  <Text fz={13} fw={500} c="dark.8">
                    Semua Pengguna
                  </Text>
                }
              />
              <Radio
                value="SpecialUsers"
                color="primary"
                label={
                  <Text fz={13} fw={500} c="dark.8">
                    Pengguna Tertentu
                  </Text>
                }
              />
              <Radio
                value="CertainRoles"
                color="primary"
                label={
                  <Text fz={13} fw={500} c="dark.8">
                    Role Tertentu
                  </Text>
                }
              />
            </Group>
          </Radio.Group>

          <AccessMemberSelects
            accessScope={accessScope}
            usersLabel="Pilih Pengguna Spesifik"
            usersPlaceholder="Pilih satu atau lebih pengguna..."
            rolesLabel="Pilih Role Spesifik"
            rolesPlaceholder="Pilih satu atau lebih role..."
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
