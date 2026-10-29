import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Image,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconArrowRight,
  IconDownload,
  IconRotateClockwise,
  IconSettings,
  IconUpload,
} from '@tabler/icons-react';
import ImageImport from '@/assets/img/SettingsAccount-Import.svg';
import ImageExport from '@/assets/img/SettingsAccount-Export.svg';
import ImageRestore from '@/assets/img/SettingsAccount-Restore.svg';
import { SettingAccountAction } from '../../../domain/settingAccount';
import { ImportAccountWizardModal } from './ImportAccountWizardModal';
import { ExportAccountModal } from './ExportAccountModal';
import { RestoreAccountModal } from './RestoreAccountModal';

export interface SettingAccountModalProps {
  opened: boolean;
  onClose: () => void;
  totalAccounts?: number;
}

export const SettingAccountModal: React.FC<SettingAccountModalProps> = ({
  opened,
  onClose,
  totalAccounts = 0,
}) => {
  const [selectedAction, setSelectedAction] = useState<SettingAccountAction>('import');

  // Sub-modal states
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const handleContinue = () => {
    onClose();
    if (selectedAction === 'import') {
      setImportOpen(true);
    } else if (selectedAction === 'export') {
      setExportOpen(true);
    } else if (selectedAction === 'restore') {
      setRestoreOpen(true);
    }
  };

  const handleCardDirectAction = (action: SettingAccountAction) => {
    setSelectedAction(action);
    onClose();
    if (action === 'import') setImportOpen(true);
    if (action === 'export') setExportOpen(true);
    if (action === 'restore') setRestoreOpen(true);
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="sm" align="center">
            <ThemeIcon
              size={40}
              radius="md"
              variant="gradient"
              gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            >
              <IconSettings size={22} stroke={1.8} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="md" c="dark.9" lh={1.2}>
                Pengaturan & Fasilitas Bagan Akun
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Pilih opsi pengelolaan master akun: impor massal, ekspor spreadsheet, atau pemulihan
                bawaan
              </Text>
            </Box>
          </Group>
        }
        size="56rem"
        radius="lg"
        centered
        padding="lg"
      >
        <Stack gap="lg" mt="xs">
          {/* 3 Modern Interactive Cards with Vector Illustrations */}
          <Grid gutter="md">
            {/* Card 1: Import */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <UnstyledButton
                onClick={() => setSelectedAction('import')}
                onDoubleClick={() => handleCardDirectAction('import')}
                style={{ width: '100%', height: '100%' }}
              >
                <Paper
                  withBorder
                  radius="lg"
                  p="md"
                  h="100%"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    borderWidth: selectedAction === 'import' ? 2 : 1,
                    borderColor:
                      selectedAction === 'import'
                        ? 'var(--mantine-color-primary-6)'
                        : 'var(--mantine-color-gray-3)',
                    backgroundColor:
                      selectedAction === 'import' ? 'var(--mantine-color-primary-0)' : 'white',
                    boxShadow:
                      selectedAction === 'import'
                        ? '0 8px 20px rgba(13, 110, 253, 0.12)'
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transform: selectedAction === 'import' ? 'translateY(-2px)' : undefined,
                  }}
                >
                  <Stack justify="space-between" h="100%" gap="md">
                    <Box>
                      {/* Top Vector Illustration Frame */}
                      <Box
                        style={{
                          height: 130,
                          width: '100%',
                          borderRadius: 12,
                          background:
                            selectedAction === 'import'
                              ? 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)'
                              : 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          marginBottom: 14,
                          border: '1px solid rgba(14, 165, 233, 0.15)',
                        }}
                      >
                        <Image
                          src={ImageImport}
                          alt="Impor Akun"
                          h={90}
                          fit="contain"
                          style={{
                            transition: 'transform 0.3s ease',
                            transform: selectedAction === 'import' ? 'scale(1.06)' : 'scale(1)',
                          }}
                        />
                      </Box>

                      {/* Content */}
                      <Group gap={6} align="center" mb={4}>
                        <ThemeIcon size={24} radius="sm" color="blue" variant="light">
                          <IconUpload size={14} />
                        </ThemeIcon>
                        <Text fw={700} size="sm" c="dark.9">
                          Impor Bagan Akun
                        </Text>
                      </Group>

                      <Text size="xs" c="dimmed" lh={1.45}>
                        Tambah akun massal dengan mengunggah berkas template spreadsheet (.xlsx /
                        .csv).
                      </Text>
                    </Box>

                    <Button
                      variant={selectedAction === 'import' ? 'filled' : 'light'}
                      color="primary"
                      size="xs"
                      radius="md"
                      fullWidth
                      rightSection={<IconArrowRight size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardDirectAction('import');
                      }}
                    >
                      Buka Wizard Impor
                    </Button>
                  </Stack>
                </Paper>
              </UnstyledButton>
            </Grid.Col>

            {/* Card 2: Export */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <UnstyledButton
                onClick={() => setSelectedAction('export')}
                onDoubleClick={() => handleCardDirectAction('export')}
                style={{ width: '100%', height: '100%' }}
              >
                <Paper
                  withBorder
                  radius="lg"
                  p="md"
                  h="100%"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    borderWidth: selectedAction === 'export' ? 2 : 1,
                    borderColor:
                      selectedAction === 'export'
                        ? 'var(--mantine-color-teal-6)'
                        : 'var(--mantine-color-gray-3)',
                    backgroundColor:
                      selectedAction === 'export' ? 'var(--mantine-color-teal-0)' : 'white',
                    boxShadow:
                      selectedAction === 'export'
                        ? '0 8px 20px rgba(18, 184, 134, 0.12)'
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transform: selectedAction === 'export' ? 'translateY(-2px)' : undefined,
                  }}
                >
                  <Stack justify="space-between" h="100%" gap="md">
                    <Box>
                      {/* Top Vector Illustration Frame */}
                      <Box
                        style={{
                          height: 130,
                          width: '100%',
                          borderRadius: 12,
                          background:
                            selectedAction === 'export'
                              ? 'linear-gradient(145deg, #ccfbf1 0%, #99f6e4 100%)'
                              : 'linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          marginBottom: 14,
                          border: '1px solid rgba(20, 184, 166, 0.15)',
                        }}
                      >
                        <Image
                          src={ImageExport}
                          alt="Ekspor Akun"
                          h={90}
                          fit="contain"
                          style={{
                            transition: 'transform 0.3s ease',
                            transform: selectedAction === 'export' ? 'scale(1.06)' : 'scale(1)',
                          }}
                        />
                      </Box>

                      {/* Content */}
                      <Group gap={6} align="center" mb={4}>
                        <ThemeIcon size={24} radius="sm" color="teal" variant="light">
                          <IconDownload size={14} />
                        </ThemeIcon>
                        <Text fw={700} size="sm" c="dark.9">
                          Ekspor Bagan Akun
                        </Text>
                      </Group>

                      <Text size="xs" c="dimmed" lh={1.45}>
                        Unduh seluruh master akun pembukuan ke dalam berkas Excel untuk analisis
                        atau arsip.
                      </Text>
                    </Box>

                    <Button
                      variant={selectedAction === 'export' ? 'filled' : 'light'}
                      color="teal"
                      size="xs"
                      radius="md"
                      fullWidth
                      rightSection={<IconArrowRight size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardDirectAction('export');
                      }}
                    >
                      Mulai Unduh Ekspor
                    </Button>
                  </Stack>
                </Paper>
              </UnstyledButton>
            </Grid.Col>

            {/* Card 3: Restore / Reset */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <UnstyledButton
                onClick={() => setSelectedAction('restore')}
                onDoubleClick={() => handleCardDirectAction('restore')}
                style={{ width: '100%', height: '100%' }}
              >
                <Paper
                  withBorder
                  radius="lg"
                  p="md"
                  h="100%"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    borderWidth: selectedAction === 'restore' ? 2 : 1,
                    borderColor:
                      selectedAction === 'restore'
                        ? 'var(--mantine-color-red-6)'
                        : 'var(--mantine-color-gray-3)',
                    backgroundColor:
                      selectedAction === 'restore' ? 'var(--mantine-color-red-0)' : 'white',
                    boxShadow:
                      selectedAction === 'restore'
                        ? '0 8px 20px rgba(224, 49, 49, 0.12)'
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transform: selectedAction === 'restore' ? 'translateY(-2px)' : undefined,
                  }}
                >
                  <Stack justify="space-between" h="100%" gap="md">
                    <Box>
                      {/* Top Vector Illustration Frame */}
                      <Box
                        style={{
                          height: 130,
                          width: '100%',
                          borderRadius: 12,
                          background:
                            selectedAction === 'restore'
                              ? 'linear-gradient(145deg, #ffe4e6 0%, #fecdd3 100%)'
                              : 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          marginBottom: 14,
                          border: '1px solid rgba(225, 29, 72, 0.15)',
                        }}
                      >
                        <Image
                          src={ImageRestore}
                          alt="Atur Ulang Akun"
                          h={90}
                          fit="contain"
                          style={{
                            transition: 'transform 0.3s ease',
                            transform: selectedAction === 'restore' ? 'scale(1.06)' : 'scale(1)',
                          }}
                        />
                      </Box>

                      {/* Content */}
                      <Group gap={6} align="center" mb={4}>
                        <ThemeIcon size={24} radius="sm" color="red" variant="light">
                          <IconRotateClockwise size={14} />
                        </ThemeIcon>
                        <Text fw={700} size="sm" c="dark.9">
                          Atur Ulang ke Default
                        </Text>
                      </Group>

                      <Text size="xs" c="dimmed" lh={1.45}>
                        Pulihkan struktur bagan akun kembali ke standar PSAK bawaan sistem
                        akuntansi.
                      </Text>
                    </Box>

                    <Button
                      variant={selectedAction === 'restore' ? 'filled' : 'light'}
                      color="red"
                      size="xs"
                      radius="md"
                      fullWidth
                      rightSection={<IconArrowRight size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardDirectAction('restore');
                      }}
                    >
                      Konfigurasi Reset
                    </Button>
                  </Stack>
                </Paper>
              </UnstyledButton>
            </Grid.Col>
          </Grid>

          <Divider />

          {/* Modal Footer */}
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="xs" c="dimmed">
              Tips: Klik kartu untuk memilih, atau klik tombol pada kartu untuk langsung memulai.
            </Text>

            <Group gap="sm">
              <Button variant="default" size="sm" radius="md" onClick={onClose}>
                Tutup
              </Button>
              <Button
                color="primary"
                size="sm"
                radius="md"
                rightSection={<IconArrowRight size={16} />}
                onClick={handleContinue}
              >
                Lanjutkan Opsi Terpilih
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* Sub-Modals for each distinct workflow */}
      <ImportAccountWizardModal opened={importOpen} onClose={() => setImportOpen(false)} />

      <ExportAccountModal
        opened={exportOpen}
        onClose={() => setExportOpen(false)}
        totalAccounts={totalAccounts}
      />

      <RestoreAccountModal opened={restoreOpen} onClose={() => setRestoreOpen(false)} />
    </>
  );
};
