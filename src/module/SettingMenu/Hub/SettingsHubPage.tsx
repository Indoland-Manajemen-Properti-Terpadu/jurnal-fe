import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Card,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  UnstyledButton,
} from '@mantine/core';
import {
  IconArrowRight,
  IconBuildingStore,
  IconClock,
  IconCreditCard,
  IconHash,
  IconPercentage,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconSitemap,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import SettingsLayout from '../components/SettingsLayout';
import { routes } from '@/router/routes';

type SettingCardConfig = {
  id: string;
  title: string;
  description: string;
  category: 'Akuntansi & Finansial' | 'Penjualan & Kas' | 'Preferensi Sistem' | 'Akses & Organisasi';
  path: string;
  icon: typeof IconSettings;
  color: string;
  badge?: string;
};

const SETTINGS_CATALOG: SettingCardConfig[] = [
  // Akuntansi & Finansial
  {
    id: 'account-mapping',
    title: 'Pemetaan Akun (Default Account)',
    description: 'Atur akun default otomatis untuk piutang, hutang, penjualan, pembelian, dan persediaan.',
    category: 'Akuntansi & Finansial',
    path: routes.settings.accountMapping,
    icon: IconSitemap,
    color: 'indigo',
    badge: 'Core Accounting',
  },
  {
    id: 'taxes',
    title: 'Master Pajak (Taxes)',
    description: 'Kelola tarif pajak (PPN, PPh) dan tautkan akun penjualan (keluaran) & pembelian (masukan).',
    category: 'Akuntansi & Finansial',
    path: routes.settings.taxes,
    icon: IconPercentage,
    color: 'teal',
  },
  {
    id: 'number-formats',
    title: 'Format Nomor Dokumen',
    description: 'Kustomisasi penomoran otomatis transaksi dan faktur penjualan (prefix, suffix, start number).',
    category: 'Akuntansi & Finansial',
    path: routes.settings.numberFormats,
    icon: IconHash,
    color: 'blue',
  },

  // Penjualan & Kas
  {
    id: 'payment-terms',
    title: 'Syarat Pembayaran (Termin)',
    description: 'Atur termin jatuh tempo faktur seperti COD (Cash on Delivery), Net 15, Net 30, atau Net 60.',
    category: 'Penjualan & Kas',
    path: routes.settings.paymentTerms,
    icon: IconClock,
    color: 'orange',
  },
  {
    id: 'payment-methods',
    title: 'Metode Pembayaran',
    description: 'Kelola cara pembayaran pelanggan (Transfer Bank, Midtrans, VA) beserta biaya admin.',
    category: 'Penjualan & Kas',
    path: routes.settings.paymentMethods,
    icon: IconCreditCard,
    color: 'cyan',
  },

  // Preferensi Sistem
  {
    id: 'general',
    title: 'Pengaturan Umum',
    description: 'Konfigurasi presisi desimal untuk pembulatan angka dan tampilan nilai mata uang pada sistem.',
    category: 'Preferensi Sistem',
    path: routes.settings.general,
    icon: IconSettings,
    color: 'violet',
  },
  {
    id: 'tags',
    title: 'Tag Transaksi',
    description: 'Buat label analitis dengan penanda warna untuk mengelompokkan transaksi lintas modul.',
    category: 'Preferensi Sistem',
    path: routes.settings.tags,
    icon: IconTag,
    color: 'pink',
  },

  // Akses & Organisasi
  {
    id: 'company-setting',
    title: 'Pengaturan Perusahaan',
    description: 'Informasi entitas bisnis, legalitas, alamat operasional, dan identitas perusahaan.',
    category: 'Akses & Organisasi',
    path: routes.baseModules.companySetting,
    icon: IconBuildingStore,
    color: 'gray',
  },
  {
    id: 'user-management',
    title: 'Manajemen Pengguna & Peran',
    description: 'Atur pengguna, hak otorisasi role, dan pembagian hak akses fitur bagi staf akuntansi.',
    category: 'Akses & Organisasi',
    path: routes.userManagement.main,
    icon: IconUsers,
    color: 'grape',
  },
];

export default function SettingsHubPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredCatalog = SETTINGS_CATALOG.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(filteredCatalog.map((item) => item.category)));

  return (
    <SettingsLayout
      title="Pusat Pengaturan Sistem"
      description="Konfigurasi parameter akuntansi, aturan transaksi, format penomoran, hingga hak otorisasi organisasi."
    >
      <Stack gap="xl">
        {/* Banner Search Bar */}
        <Paper
          p={{ base: 'md', sm: 'xl' }}
          radius="lg"
          withBorder
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
          }}
        >
          <Grid align="center" gutter="md">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Title order={3} c="white" fw={700}>
                Konfigurasi Parameter Akuntansi & Operasional
              </Title>
              <Text size="sm" c="gray.4" mt={4}>
                Semua parameter terintegrasi langsung dengan modul Jurnal Umum, Faktur Penjualan, Kas & Bank, dan Pelaporan Keuangan.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                placeholder="Cari pengaturan (contoh: pajak, termin, akun)..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                radius="md"
                size="md"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Grouped Cards */}
        {categories.map((cat) => {
          const items = filteredCatalog.filter((item) => item.category === cat);
          return (
            <Stack key={cat} gap="md">
              <Group gap="xs" align="center">
                <Text fw={700} size="md" c="dark.7" tt="uppercase" lts={0.5}>
                  {cat}
                </Text>
                <Badge variant="light" color="gray" size="sm">
                  {items.length} Menu
                </Badge>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <UnstyledButton
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      style={{ height: '100%' }}
                    >
                      <Card
                        withBorder
                        padding="lg"
                        radius="md"
                        bg="white"
                        style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.borderColor = '#CBD5E1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                      >
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start">
                            <ThemeIcon size={40} radius="md" color={item.color} variant="light">
                              <Icon size={22} stroke={1.8} />
                            </ThemeIcon>
                            {item.badge && (
                              <Badge size="xs" color="indigo" variant="light">
                                {item.badge}
                              </Badge>
                            )}
                          </Group>

                          <div>
                            <Text fw={700} size="sm" c="dark.8">
                              {item.title}
                            </Text>
                            <Text size="xs" c="dimmed" mt={4} lineClamp={2}>
                              {item.description}
                            </Text>
                          </div>
                        </Stack>

                        <Group justify="flex-end" mt="md" gap={4}>
                          <Text size="xs" fw={600} c="primary.8">
                            Buka Pengaturan
                          </Text>
                          <IconArrowRight size={14} color="#0F766E" />
                        </Group>
                      </Card>
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            </Stack>
          );
        })}

        {filteredCatalog.length === 0 && (
          <Paper withBorder p="xl" radius="md" ta="center" bg="white">
            <Text c="dimmed" size="sm">
              Tidak ada menu pengaturan yang sesuai dengan pencarian &quot;{search}&quot;.
            </Text>
          </Paper>
        )}
      </Stack>
    </SettingsLayout>
  );
}

