import { useMemo } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Indicator,
  Kbd,
  Menu,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import {
  Bell,
  CalendarBlank,
  CaretDown,
  GearSix,
  MagnifyingGlass,
  Plus,
  SignOut,
  UserCircle,
  Notebook,
  Bank,
  AddressBook,
} from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { capitalize } from 'lodash';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/store/useAuthentications';
import { usePendingChangesCount } from '@/module/Dashboard';
import classes from './page.module.css';

type HeaderNavProps = {
  mobileOpened?: boolean;
  toggleMobile?: () => void;
  desktopOpened?: boolean;
  toggleDesktop?: () => void;
};

/** Maps the first URL segment to a human-readable section title. */
const SECTION_TITLES: Array<{ prefix: string; title: string; group: string }> = [
  { prefix: '/dashboard', title: 'Ringkasan', group: 'Utama' },
  { prefix: '/result-reports', title: 'Laporan Keuangan', group: 'Utama' },
  { prefix: '/budget-planning', title: 'Perencanaan Anggaran', group: 'Utama' },
  { prefix: '/bank-cash', title: 'Kas & Bank', group: 'Transaksi' },
  { prefix: '/sales', title: 'Penjualan', group: 'Transaksi' },
  { prefix: '/setting-budget', title: 'Penjualan', group: 'Transaksi' },
  { prefix: '/pembelian', title: 'Pembelian', group: 'Transaksi' },
  { prefix: '/finance/cost', title: 'Biaya', group: 'Transaksi' },
  { prefix: '/pending-changes', title: 'Persetujuan Perubahan', group: 'Transaksi' },
  { prefix: '/products', title: 'Produk', group: 'Operasional' },
  { prefix: '/production', title: 'Produksi', group: 'Operasional' },
  { prefix: '/fulfillment', title: 'Pemenuhan', group: 'Operasional' },
  { prefix: '/general-journal/detail-transaction-journal', title: 'Detail Transaksi Jurnal', group: 'Buku Besar & Jurnal' },
  { prefix: '/general-journal/detail-account', title: 'Detail Buku Besar', group: 'Buku Besar & Jurnal' },
  { prefix: '/general-journal', title: 'Daftar Akun', group: 'Master Data' },
  { prefix: '/asset', title: 'Asset', group: 'Master Data' },
  { prefix: '/contact', title: 'Kontak', group: 'Master Data' },
  { prefix: '/settings/company-setting', title: 'Pengaturan Perusahaan', group: 'Pengaturan' },
  { prefix: '/settings', title: 'Pengaturan', group: 'Pengaturan' },
  { prefix: '/user-management', title: 'Manajemen Pengguna', group: 'Pengaturan' },
  { prefix: '/profile', title: 'Profil', group: 'Akun' },
];

const HeaderNav = ({ desktopOpened: _desktopOpened, toggleMobile, mobileOpened }: HeaderNavProps) => {
  const { userName, clearTokens } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pendingQ = usePendingChangesCount();
  const pending = pendingQ.data ?? 0;

  const section = useMemo(
    () => SECTION_TITLES.find((s) => pathname.startsWith(s.prefix)) ?? { title: 'Jurnal', group: 'ProApps' },
    [pathname]
  );

  const displayName = capitalize(userName || 'Finance');
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date()
  );

  const handleLogout = () => {
    clearTokens();
    navigate(routes.login);
  };

  return (
    <Group justify="space-between" w="100%" h="100%" wrap="nowrap" gap="md">
      {/* Left: burger + section title */}
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" aria-label="Buka menu" />
        <Box style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.8} visibleFrom="xs">
            {section.group}
          </Text>
          <Text fw={800} fz={{ base: 16, sm: 19 }} c="dark.8" lh={1.2} truncate>
            {section.title}
          </Text>
        </Box>
      </Group>

      {/* Center: command search */}
      <TextInput
        visibleFrom="md"
        placeholder="Cari akun, jurnal, kontak…"
        leftSection={<MagnifyingGlass size={18} weight="bold" />}
        rightSection={<Kbd size="xs">⌘K</Kbd>}
        rightSectionWidth={48}
        radius="xl"
        className={classes.search}
        style={{ flex: 1, maxWidth: 420 }}
        aria-label="Pencarian global"
      />

      {/* Right: actions */}
      <Group gap={8} wrap="nowrap">
        <Group gap={6} className={classes.chip} visibleFrom="lg">
          <CalendarBlank size={16} weight="duotone" />
          <Text size="xs" fw={600} c="dark.6">
            {today}
          </Text>
        </Group>

        <Menu shadow="xl" width={220} radius="lg" position="bottom-end">
          <Menu.Target>
            <Tooltip label="Buat baru" withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                variant="gradient"
                gradient={{ from: '#053079', to: '#09B2FF', deg: 135 }}
                className={classes.glow}
                aria-label="Buat baru"
              >
                <Plus size={18} weight="bold" />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Buat cepat</Menu.Label>
            <Menu.Item leftSection={<Notebook size={16} weight="duotone" />} onClick={() => navigate(routes.generalJournal.addTransactionJournal)}>
              Jurnal Umum
            </Menu.Item>
            <Menu.Item leftSection={<Bank size={16} weight="duotone" />} onClick={() => navigate(routes.BankAndCash.AddReceiveMoney)}>
              Terima Uang
            </Menu.Item>
            <Menu.Item leftSection={<Bank size={16} weight="duotone" />} onClick={() => navigate(routes.BankAndCash.AddSentMoney)}>
              Kirim Uang
            </Menu.Item>
            <Menu.Item leftSection={<AddressBook size={16} weight="duotone" />} onClick={() => navigate(routes.Contact.Main)}>
              Kontak
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="xl" width={300} radius="lg" position="bottom-end">
          <Menu.Target>
            <Indicator
              inline
              disabled={pending === 0}
              label={pending > 99 ? '99+' : pending}
              size={16}
              color="red"
              offset={4}
              withBorder
            >
              <ActionIcon size={38} radius="xl" variant="default" className={classes.iconBtn} aria-label="Notifikasi">
                <Bell size={20} weight="duotone" />
              </ActionIcon>
            </Indicator>
          </Menu.Target>
          <Menu.Dropdown p="xs">
            <Group justify="space-between" px="xs" py={6}>
              <Text fw={700} size="sm">Notifikasi</Text>
              <Badge size="sm" variant="light" color={pending > 0 ? 'red' : 'gray'}>
                {pending} baru
              </Badge>
            </Group>
            <Menu.Divider />
            {pending > 0 ? (
              <Menu.Item
                leftSection={<GearSix size={18} weight="duotone" />}
                onClick={() => navigate('/settings/approval-setting')}
              >
                <Text size="sm" fw={600}>{pending} perubahan menunggu persetujuan</Text>
                <Text size="xs" c="dimmed">Tinjau dan setujui agar jurnal tercatat.</Text>
              </Menu.Item>
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="md">
                Semua beres — tidak ada notifikasi.
              </Text>
            )}
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="xl" width={220} radius="lg" position="bottom-end">
          <Menu.Target>
            <UnstyledButton className={classes.user} aria-label="Menu pengguna">
              <Group gap={8} wrap="nowrap">
                <Avatar size={32} radius="xl" variant="gradient" gradient={{ from: '#053079', to: '#09B2FF', deg: 135 }}>
                  {displayName.slice(0, 1)}
                </Avatar>
                <Box visibleFrom="sm" style={{ minWidth: 0 }}>
                  <Text fz={13} fw={700} c="dark.8" lh={1.1} truncate maw={120}>
                    {displayName}
                  </Text>
                  <Text fz={11} c="dimmed" lh={1.2}>
                    Akun aktif
                  </Text>
                </Box>
                <CaretDown size={14} weight="bold" color="var(--mantine-color-gray-5)" />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{displayName}</Menu.Label>
            <Menu.Item leftSection={<UserCircle size={16} weight="duotone" />} onClick={() => navigate(routes.profile)}>
              Profil
            </Menu.Item>
            <Menu.Item leftSection={<GearSix size={16} weight="duotone" />} onClick={() => navigate('/settings/company-setting')}>
              Pengaturan
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<SignOut size={16} weight="duotone" />} onClick={handleLogout}>
              Keluar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default HeaderNav;
