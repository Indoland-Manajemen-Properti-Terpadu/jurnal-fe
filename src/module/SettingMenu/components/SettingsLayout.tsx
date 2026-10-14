import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconClock,
  IconCreditCard,
  IconHash,
  IconLayoutGrid,
  IconPercentage,
  IconSettings,
  IconShieldCheck,
  IconSitemap,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import { routes } from '@/router/routes';

type NavTabItem = {
  label: string;
  path: string;
  icon: typeof IconSettings;
  description: string;
};

const SETTINGS_NAV_ITEMS: NavTabItem[] = [
  {
    label: 'Pusat Pengaturan',
    path: routes.settings.main,
    icon: IconLayoutGrid,
    description: 'Ringkasan & katalog parameter sistem',
  },
  {
    label: 'Pengaturan Umum',
    path: routes.settings.general,
    icon: IconSettings,
    description: 'Format angka & presisi desimal',
  },
  {
    label: 'Pemetaan Akun',
    path: routes.settings.accountMapping,
    icon: IconSitemap,
    description: 'Akun default transaksi otomatis',
  },
  {
    label: 'Pajak',
    path: routes.settings.taxes,
    icon: IconPercentage,
    description: 'Master tarif & akun pajak',
  },
  {
    label: 'Syarat Pembayaran',
    path: routes.settings.paymentTerms,
    icon: IconClock,
    description: 'Termin pembayaran & jatuh tempo',
  },
  {
    label: 'Metode Pembayaran',
    path: routes.settings.paymentMethods,
    icon: IconCreditCard,
    description: 'Cara bayar & biaya admin',
  },
  {
    label: 'Format Penomoran',
    path: routes.settings.numberFormats,
    icon: IconHash,
    description: 'Prefix & penomoran otomatis dokumen',
  },
  {
    label: 'Tag Transaksi',
    path: routes.settings.tags,
    icon: IconTag,
    description: 'Dimensi & label pelaporan transaksi',
  },
  {
    label: 'Pengaturan Perusahaan',
    path: routes.baseModules.companySetting,
    icon: IconBuildingStore,
    description: 'Profil & data legalitas entitas',
  },
  {
    label: 'Manajemen Pengguna',
    path: routes.userManagement.main,
    icon: IconUsers,
    description: 'Akses staf & hak otorisasi',
  },
];

type SettingsLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function SettingsLayout({
  children,
  title,
  description,
  action,
}: Readonly<SettingsLayoutProps>) {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentActive = (itemPath: string) => {
    if (itemPath === routes.settings.main) {
      return location.pathname === routes.settings.main;
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <AppShellLayout>
      <Box bg="#F8FAFC" style={{ minHeight: 'calc(100vh - 72px)' }} pb={60}>
        {/* Top Header Card */}
        <Paper
          p={{ base: 'md', sm: 'xl' }}
          radius={0}
          style={{
            borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          }}
        >
          <Container fluid px={{ base: 'xs', sm: 'md' }}>
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md" mb="lg">
              <Stack gap={4}>
                <Group gap="xs" align="center">
                  <ThemeIcon size={32} radius="md" color="primary" variant="light">
                    <IconSettings size={18} />
                  </ThemeIcon>
                  <Title order={2} c="dark.8" fz={{ base: 20, sm: 24 }} fw={700}>
                    {title}
                  </Title>
                </Group>
                {description && (
                  <Text size="sm" c="dimmed" ml={{ sm: 42 }}>
                    {description}
                  </Text>
                )}
              </Stack>

              {action && <Group gap="xs">{action}</Group>}
            </Group>

            {/* Horizontal Scrollable Tabs */}
            <ScrollArea type="never" offsetScrollbars={false}>
              <Group gap={6} wrap="nowrap" pt={4}>
                {SETTINGS_NAV_ITEMS.map((item) => {
                  const active = isCurrentActive(item.path);
                  const Icon = item.icon;

                  return (
                    <UnstyledButton
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      px="md"
                      py="xs"
                      style={{
                        borderRadius: 8,
                        transition: 'all 0.15s ease',
                        backgroundColor: active ? '#1E293B' : 'transparent',
                        color: active ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        whiteSpace: 'nowrap',
                        fontWeight: active ? 600 : 500,
                        fontSize: 13,
                        border: active ? '1px solid #0F172A' : '1px solid transparent',
                      }}
                    >
                      <Icon size={16} stroke={active ? 2 : 1.6} />
                      <span>{item.label}</span>
                    </UnstyledButton>
                  );
                })}
              </Group>
            </ScrollArea>
          </Container>
        </Paper>

        {/* Content Body */}
        <Container fluid px={{ base: 'md', sm: 'xl' }} mt="lg">
          {children}
        </Container>
      </Box>
    </AppShellLayout>
  );
}

