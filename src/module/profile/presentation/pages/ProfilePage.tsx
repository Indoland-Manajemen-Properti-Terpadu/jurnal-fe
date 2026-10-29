import { useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  CopyButton,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconCircleCheckFilled,
  IconClock,
  IconCopy,
  IconDeviceDesktop,
  IconFileText,
  IconInfoCircle,
  IconKey,
  IconLock,
  IconMail,
  IconReceipt,
  IconReportMoney,
  IconShieldCheck,
  IconShieldLock,
  IconShoppingCart,
  IconUser,
  IconUserCircle,
  IconX,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { useGetProfile, useUpdateProfile } from '../../infrastructure/profileApi';
import { notifications } from '@mantine/notifications';

export default function ProfilePage() {
  const { data: user, isLoading } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();

  // Personal Info form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync state with fetched user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (isLoading) {
    return (
      <AppShellLayout>
        <Center h={450}>
          <Stack align="center" gap="sm">
            <Loader size="lg" color="primary.6" type="dots" />
            <Text size="sm" c="dimmed">
              Memuat profil pengguna...
            </Text>
          </Stack>
        </Center>
      </AppShellLayout>
    );
  }

  const isProfileDirty = user && (name !== (user.name || '') || email !== (user.email || ''));

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!name.trim() || !email.trim()) {
      notifications.show({
        color: 'red',
        title: 'Validasi Gagal',
        message: 'Nama dan email tidak boleh kosong.',
      });
      return;
    }

    updateProfileMutation.mutate({
      id: user.id,
      name: name.trim(),
      email: email.trim(),
    });
  };

  const handleResetPersonalInfo = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (newPassword.length < 8) {
      notifications.show({
        color: 'red',
        title: 'Validasi Gagal',
        message: 'Kata sandi baru minimal harus 8 karakter.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        color: 'red',
        title: 'Validasi Gagal',
        message: 'Konfirmasi kata sandi tidak cocok.',
      });
      return;
    }

    updateProfileMutation.mutate(
      {
        id: user.id,
        password: newPassword,
      },
      {
        onSuccess: () => {
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  // Password validation checks
  const isMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Permissions matrix definition
  const permissionModules = [
    {
      title: 'Buku Besar & Jurnal Umum',
      icon: IconFileText,
      description: 'Pencatatan jurnal memorial, penyesuaian, dan ringkasan mutasi saldo akun.',
      access: 'Penuh (Baca & Tulis)',
      color: 'blue',
    },
    {
      title: 'Kas, Bank & Rekonsiliasi',
      icon: IconReportMoney,
      description: 'Impor mutasi rekening koran, pencocokan transaksi bank, dan penarikan kas.',
      access: 'Penuh (Baca & Tulis)',
      color: 'teal',
    },
    {
      title: 'Penjualan & Piutang Dagang',
      icon: IconReceipt,
      description: 'Penerbitan faktur penjualan, pelacakan pelunasan piutang, dan penagihan.',
      access: 'Penuh (Baca & Tulis)',
      color: 'indigo',
    },
    {
      title: 'Pembelian & Hutang Usaha',
      icon: IconShoppingCart,
      description: 'Faktur pembelian operasional, pembayaran hutang suplier, dan rekap beban.',
      access: 'Penuh (Baca & Tulis)',
      color: 'cyan',
    },
    {
      title: 'Laporan Keuangan & Fiskal',
      icon: IconShieldCheck,
      description: 'Akses laporan laba rugi, neraca saldo, arus kas, dan perubahan modal.',
      access: 'Penuh (Eksport & Analisis)',
      color: 'emerald',
    },
    {
      title: 'Master Data & Pengaturan Entitas',
      icon: IconBuilding,
      description: 'Pengelolaan daftar akun COA, termin pembayaran, pajak, dan profil entitas.',
      access: user?.role === 'superadmin' || user?.role === 'admin' ? 'Administrator' : 'Terbatas',
      color: 'grape',
    },
  ];

  const formattedJoinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  const formattedUpdatedDate = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  return (
    <AppShellLayout>
      <Stack gap="lg" pb="xl">
        {/* Module Header */}
        <ModuleHeader
          icon={IconUserCircle}
          title="Profil Saya"
          description="Kelola informasi akun pengguna, preferensi keamanan sandi, rincian hak akses, dan entitas bisnis aktif Anda."
          breadcrumbs={[
            { label: 'Beranda', to: '/dashboard' },
            { label: 'Profil Saya' },
          ]}
        />

        {/* Hero Profile Card */}
        <Paper
          radius="lg"
          withBorder
          style={{
            overflow: 'hidden',
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          {/* Top Hero Gradient Banner */}
          <Box
            p={{ base: 'md', sm: 'xl' }}
            style={{
              background: 'linear-gradient(135deg, #053079 0%, #0d47a1 55%, #09B2FF 100%)',
              position: 'relative',
            }}
          >
            <Group align="center" gap="lg" wrap="wrap">
              <Avatar
                size={88}
                radius={88}
                color="primary.8"
                style={{
                  border: '3.5px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  backgroundColor: '#ffffff',
                  color: '#053079',
                  fontWeight: 700,
                  fontSize: '2rem',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <Stack gap={4} style={{ flex: 1, minWidth: 220 }}>
                <Group gap="xs" wrap="wrap" align="center">
                  <Title order={2} c="white" fz={{ base: 22, sm: 26 }} fw={700}>
                    {user?.name || 'Pengguna'}
                  </Title>
                  <Badge
                    size="md"
                    variant="filled"
                    color="cyan.4"
                    c="primary.9"
                    fw={700}
                    style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {user?.role || 'User'}
                  </Badge>
                  {user?.isEmailVerified ? (
                    <Badge
                      size="md"
                      variant="light"
                      color="teal.0"
                      c="white"
                      leftSection={<IconCircleCheckFilled size={14} color="#38d9a9" />}
                    >
                      Terverifikasi
                    </Badge>
                  ) : (
                    <Badge size="md" variant="light" color="yellow.2" c="yellow.9">
                      Belum Terverifikasi
                    </Badge>
                  )}
                </Group>

                <Group gap="md" wrap="wrap" mt={4}>
                  <Group gap={6}>
                    <IconMail size={16} color="rgba(255, 255, 255, 0.85)" />
                    <Text size="sm" c="white" opacity={0.9}>
                      {user?.email || '-'}
                    </Text>
                  </Group>

                  {user?.site?.name && (
                    <Group gap={6}>
                      <IconBuilding size={16} color="rgba(255, 255, 255, 0.85)" />
                      <Text size="sm" c="white" opacity={0.9}>
                        Site: {user.site.name}
                      </Text>
                    </Group>
                  )}

                  <Group gap={6}>
                    <IconCalendar size={16} color="rgba(255, 255, 255, 0.85)" />
                    <Text size="sm" c="white" opacity={0.9}>
                      Bergabung: {formattedJoinedDate}
                    </Text>
                  </Group>
                </Group>
              </Stack>

              {user?.id && (
                <CopyButton value={user.id} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Tersalin!' : 'Salin User ID'} withArrow position="bottom">
                      <Button
                        size="xs"
                        variant="white"
                        c="primary.9"
                        leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                        onClick={copy}
                        radius="md"
                      >
                        {copied ? 'Tersalin' : 'Salin ID Pengguna'}
                      </Button>
                    </Tooltip>
                  )}
                </CopyButton>
              )}
            </Group>
          </Box>

          {/* Quick Metrics Bar */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={36} radius="md" variant="light" color="primary">
                <IconUser size={18} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed" fw={600}>
                  STATUS AKUN
                </Text>
                <Text size="sm" fw={600} c="primary.9">
                  {user?.isEmailVerified ? 'Aktif & Terverifikasi' : 'Aktif (Belum Verifikasi)'}
                </Text>
              </Box>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={36} radius="md" variant="light" color="teal">
                <IconKey size={18} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed" fw={600}>
                  PERAN OTORISASI
                </Text>
                <Text size="sm" fw={600} c="teal.8">
                  {user?.role ? user.role.toUpperCase() : 'STANDARD'}
                </Text>
              </Box>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={36} radius="md" variant="light" color="indigo">
                <IconBuilding size={18} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed" fw={600}>
                  ENTITAS SITE
                </Text>
                <Text size="sm" fw={600} c="indigo.9" truncate="end">
                  {user?.site?.name || 'Utama'}
                </Text>
              </Box>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={36} radius="md" variant="light" color="cyan">
                <IconClock size={18} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed" fw={600}>
                  TERAKHIR DIPERBARUI
                </Text>
                <Text size="sm" fw={600} c="cyan.9">
                  {formattedUpdatedDate}
                </Text>
              </Box>
            </Group>
          </SimpleGrid>
        </Paper>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" radius="md" color="primary">
          <Tabs.List>
            <Tabs.Tab value="personal" leftSection={<IconUser size={16} />}>
              Informasi Pribadi
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShieldLock size={16} />}>
              Keamanan & Kata Sandi
            </Tabs.Tab>
            <Tabs.Tab value="roles" leftSection={<IconKey size={16} />}>
              Hak Akses & Peran
            </Tabs.Tab>
            <Tabs.Tab value="site" leftSection={<IconBuilding size={16} />}>
              Site & Entitas Bisnis
            </Tabs.Tab>
          </Tabs.List>

          {/* TAB 1: INFORMASI PRIBADI */}
          <Tabs.Panel value="personal" pt="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder radius="md" p="xl">
                  <Title order={4} mb="xs" c="primary.9">
                    Data Pribadi Pengguna
                  </Title>
                  <Text size="sm" c="dimmed" mb="lg">
                    Perbarui nama lengkap dan alamat email yang terhubung dengan akun pembukuan Anda.
                  </Text>

                  <form onSubmit={handleSavePersonalInfo}>
                    <Stack gap="md">
                      <TextInput
                        label="Nama Lengkap"
                        placeholder="Masukkan nama lengkap"
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                        leftSection={<IconUser size={18} />}
                        required
                      />

                      <TextInput
                        label="Alamat Email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        leftSection={<IconMail size={18} />}
                        description="Email digunakan untuk autentikasi masuk dan pengiriman notifikasi pembukuan."
                        required
                      />

                      <TextInput
                        label="ID Pengguna (Sistem)"
                        value={user?.id || '-'}
                        readOnly
                        leftSection={<IconInfoCircle size={18} />}
                        rightSection={
                          user?.id ? (
                            <CopyButton value={user.id} timeout={2000}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Tersalin' : 'Salin'} withArrow>
                                  <Button
                                    variant="subtle"
                                    color="gray"
                                    size="xs"
                                    p={4}
                                    onClick={copy}
                                  >
                                    {copied ? <IconCheck size={16} color="teal" /> : <IconCopy size={16} />}
                                  </Button>
                                </Tooltip>
                              )}
                            </CopyButton>
                          ) : null
                        }
                        styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)' } }}
                      />

                      <Group justify="flex-end" gap="sm" mt="md">
                        <Button
                          variant="default"
                          onClick={handleResetPersonalInfo}
                          disabled={!isProfileDirty || updateProfileMutation.isPending}
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          color="primary.6"
                          disabled={!isProfileDirty}
                          loading={updateProfileMutation.isPending}
                        >
                          Simpan Perubahan
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack gap="md">
                  <Paper withBorder radius="md" p="md">
                    <Title order={5} mb="sm" c="primary.9">
                      Rincian Keanggotaan
                    </Title>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Tanggal Terdaftar
                        </Text>
                        <Text size="xs" fw={600}>
                          {formattedJoinedDate}
                        </Text>
                      </Group>
                      <Divider />
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Status Email
                        </Text>
                        <Badge size="xs" color={user?.isEmailVerified ? 'teal' : 'yellow'}>
                          {user?.isEmailVerified ? 'Terverifikasi' : 'Belum Diverifikasi'}
                        </Badge>
                      </Group>
                      <Divider />
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Role Pengguna
                        </Text>
                        <Badge size="xs" color="primary">
                          {user?.role || 'User'}
                        </Badge>
                      </Group>
                      <Divider />
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Site Default
                        </Text>
                        <Text size="xs" fw={600}>
                          {user?.site?.name || '-'}
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>

                  <Paper
                    withBorder
                    radius="md"
                    p="md"
                    style={{
                      background: 'linear-gradient(135deg, rgba(5, 48, 121, 0.04) 0%, rgba(9, 178, 255, 0.08) 100%)',
                    }}
                  >
                    <Group align="flex-start" gap="sm" wrap="nowrap">
                      <ThemeIcon size={32} radius="md" color="primary" variant="light">
                        <IconShieldCheck size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text size="xs" fw={700} c="primary.9">
                          Integritas Akun Terjamin
                        </Text>
                        <Text size="xs" c="dimmed" mt={2} lh={1.4}>
                          Setiap transaksi dan jurnal yang Anda catat akan tercatat dalam jejak audit (Audit Trail) sistem demi kepatuhan akuntansi.
                        </Text>
                      </Box>
                    </Group>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* TAB 2: KEAMANAN & KATA SANDI */}
          <Tabs.Panel value="security" pt="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Paper withBorder radius="md" p="xl">
                  <Title order={4} mb="xs" c="primary.9">
                    Perbarui Kata Sandi
                  </Title>
                  <Text size="sm" c="dimmed" mb="lg">
                    Pastikan kata sandi Anda kuat dan tidak digunakan kembali pada aplikasi lain.
                  </Text>

                  <form onSubmit={handleUpdatePassword}>
                    <Stack gap="md">
                      <PasswordInput
                        label="Kata Sandi Baru"
                        placeholder="Minimal 8 karakter kombinasi"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.currentTarget.value)}
                        leftSection={<IconLock size={18} />}
                        required
                      />

                      <PasswordInput
                        label="Konfirmasi Kata Sandi Baru"
                        placeholder="Masukkan ulang kata sandi baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                        leftSection={<IconLock size={18} />}
                        required
                      />

                      {/* Password Requirements Checklist */}
                      <Paper withBorder radius="md" p="sm" bg="gray.0">
                        <Text size="xs" fw={700} mb="xs" c="dimmed">
                          STANDAR KEAMANAN KATA SANDI:
                        </Text>
                        <Stack gap={6}>
                          <Group gap="xs">
                            {isMinLength ? (
                              <IconCheck size={14} color="var(--mantine-color-teal-6)" />
                            ) : (
                              <IconX size={14} color="var(--mantine-color-red-6)" />
                            )}
                            <Text size="xs" c={isMinLength ? 'teal.8' : 'dimmed'}>
                              Panjang minimal 8 karakter
                            </Text>
                          </Group>

                          <Group gap="xs">
                            {hasLetter ? (
                              <IconCheck size={14} color="var(--mantine-color-teal-6)" />
                            ) : (
                              <IconX size={14} color="var(--mantine-color-red-6)" />
                            )}
                            <Text size="xs" c={hasLetter ? 'teal.8' : 'dimmed'}>
                              Mengandung huruf alfabet
                            </Text>
                          </Group>

                          <Group gap="xs">
                            {hasNumber ? (
                              <IconCheck size={14} color="var(--mantine-color-teal-6)" />
                            ) : (
                              <IconX size={14} color="var(--mantine-color-red-6)" />
                            )}
                            <Text size="xs" c={hasNumber ? 'teal.8' : 'dimmed'}>
                              Mengandung angka
                            </Text>
                          </Group>

                          <Group gap="xs">
                            {isPasswordMatch ? (
                              <IconCheck size={14} color="var(--mantine-color-teal-6)" />
                            ) : (
                              <IconX size={14} color="var(--mantine-color-red-6)" />
                            )}
                            <Text size="xs" c={isPasswordMatch ? 'teal.8' : 'dimmed'}>
                              Konfirmasi kata sandi cocok
                            </Text>
                          </Group>
                        </Stack>
                      </Paper>

                      <Group justify="flex-end" gap="sm" mt="md">
                        <Button
                          variant="default"
                          onClick={() => {
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          disabled={!newPassword && !confirmPassword}
                        >
                          Reset Input
                        </Button>
                        <Button
                          type="submit"
                          color="primary.6"
                          disabled={!isMinLength || !isPasswordMatch}
                          loading={updateProfileMutation.isPending}
                        >
                          Perbarui Kata Sandi
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="md">
                  <Paper withBorder radius="md" p="md">
                    <Group gap="xs" mb="xs">
                      <ThemeIcon size={28} radius="md" color="teal" variant="light">
                        <IconDeviceDesktop size={16} />
                      </ThemeIcon>
                      <Title order={5} c="primary.9">
                        Sesi Autentikasi Aktif
                      </Title>
                    </Group>
                    <Text size="xs" c="dimmed" mb="sm">
                      Sesi masuk saat ini dilindungi dengan token JWT Bearer yang diperbarui otomatis secara berkala.
                    </Text>

                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Metode Enkripsi
                        </Text>
                        <Badge size="xs" variant="outline" color="blue">
                          Bearer JWT (HS256)
                        </Badge>
                      </Group>
                      <Divider />
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Status Penyegaran Token
                        </Text>
                        <Badge size="xs" color="teal">
                          Otomatis Aktif
                        </Badge>
                      </Group>
                    </Stack>
                  </Paper>

                  <Paper withBorder radius="md" p="md" bg="blue.0">
                    <Group align="flex-start" gap="xs">
                      <IconInfoCircle size={20} color="var(--mantine-color-primary-6)" />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={700} c="primary.9">
                          Tips Keamanan Akun
                        </Text>
                        <Text size="xs" c="primary.8" mt={2} lh={1.4}>
                          Jangan pernah memberikan kata sandi atau kredensial akun kepada siapapun. Tim Proapps tidak pernah meminta kata sandi Anda.
                        </Text>
                      </Box>
                    </Group>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* TAB 3: HAK AKSES & PERAN */}
          <Tabs.Panel value="roles" pt="md">
            <Stack gap="md">
              <Paper withBorder radius="md" p="lg">
                <Group justify="space-between" align="center" wrap="wrap" mb="md">
                  <Box>
                    <Title order={4} c="primary.9">
                      Matriks Hak Akses Akuntansi
                    </Title>
                    <Text size="sm" c="dimmed">
                      Tingkat otorisasi modul pembukuan dan operasional berdasarkan peran akun Anda saat ini.
                    </Text>
                  </Box>
                  <Group gap="xs">
                    <Badge size="lg" color="primary" variant="filled">
                      {user?.role?.toUpperCase() || 'PENGGUNA'}
                    </Badge>
                    <Badge size="lg" color="teal" variant="light">
                      Akses Multi-Modul
                    </Badge>
                  </Group>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {permissionModules.map((module) => {
                    const ModIcon = module.icon;
                    return (
                      <Card key={module.title} withBorder radius="md" padding="md">
                        <Group justify="space-between" align="flex-start" mb="xs">
                          <ThemeIcon size={38} radius="md" color={module.color} variant="light">
                            <ModIcon size={20} />
                          </ThemeIcon>
                          <Badge size="xs" color={module.color} variant="light">
                            {module.access}
                          </Badge>
                        </Group>

                        <Text size="sm" fw={700} c="primary.9" mb={4}>
                          {module.title}
                        </Text>
                        <Text size="xs" c="dimmed" lh={1.4}>
                          {module.description}
                        </Text>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* TAB 4: SITE & ENTITAS BISNIS */}
          <Tabs.Panel value="site" pt="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Paper withBorder radius="md" p="xl">
                  <Title order={4} mb="xs" c="primary.9">
                    Informasi Entitas & Site Aktif
                  </Title>
                  <Text size="sm" c="dimmed" mb="lg">
                    Data entitas pembukuan yang menjadi lingkup kerja operasional akun Anda saat ini.
                  </Text>

                  <Stack gap="md">
                    <TextInput
                      label="Nama Site / Entitas Bisnis"
                      value={user?.site?.name || 'Proapps Accounting'}
                      readOnly
                      leftSection={<IconBuilding size={18} />}
                      styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)', fontWeight: 600 } }}
                    />

                    <TextInput
                      label="ID Entitas (Sistem)"
                      value={user?.site?.id || '-'}
                      readOnly
                      leftSection={<IconInfoCircle size={18} />}
                      rightSection={
                        user?.site?.id ? (
                          <CopyButton value={user.site.id} timeout={2000}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? 'Tersalin' : 'Salin'} withArrow>
                                <Button
                                  variant="subtle"
                                  color="gray"
                                  size="xs"
                                  p={4}
                                  onClick={copy}
                                >
                                  {copied ? <IconCheck size={16} color="teal" /> : <IconCopy size={16} />}
                                </Button>
                              </Tooltip>
                            )}
                          </CopyButton>
                        ) : null
                      }
                      styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)' } }}
                    />

                    <Group gap="md">
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed" fw={600} mb={4}>
                          STATUS KONEKSI SITE
                        </Text>
                        <Badge size="md" color="teal" variant="light" leftSection={<IconCircleCheckFilled size={14} />}>
                          Terhubung & Aktif
                        </Badge>
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed" fw={600} mb={4}>
                          LINGKUP PEMBUKUAN
                        </Text>
                        <Badge size="md" color="blue" variant="light">
                          Standar SAK & Pajak IDR
                        </Badge>
                      </Box>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <Stack gap="md">
                  <Paper withBorder radius="md" p="md">
                    <Title order={5} mb="xs" c="primary.9">
                      Pengelolaan Multi-Entitas
                    </Title>
                    <Text size="xs" c="dimmed" mb="md" lh={1.4}>
                      Sistem akuntansi Proapps mendukung multi-site dan multi-cabang. Akses buku besar dan saldo akun terisolasi sesuai site yang dipilih.
                    </Text>

                    <Paper withBorder radius="sm" p="xs" bg="gray.0">
                      <Group gap="xs" wrap="nowrap">
                        <IconInfoCircle size={18} color="var(--mantine-color-dimmed)" />
                        <Text size="xs" c="dimmed">
                          Untuk pengalihan site atau permintaan akses entitas cabang lain, silakan ajukan ke Superadmin perusahaan.
                        </Text>
                      </Group>
                    </Paper>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </AppShellLayout>
  );
}
