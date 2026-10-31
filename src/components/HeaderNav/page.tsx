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
import { usePendingChangesCount } from '@/module/pending-changes';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import classes from './page.module.css';

type HeaderNavProps = {
  mobileOpened?: boolean;
  toggleMobile?: () => void;
  desktopOpened?: boolean;
  toggleDesktop?: () => void;
};

/** Maps the first URL segment to i18n keys for section title and group. */
const SECTION_DEFS: Array<{ prefix: string; titleKey: string; groupKey: string }> = [
  { prefix: '/dashboard', titleKey: 'dashboard', groupKey: 'groupMain' },
  { prefix: '/result-reports', titleKey: 'financialReports', groupKey: 'groupMain' },
  { prefix: '/budget-planning', titleKey: 'budgetPlanning', groupKey: 'groupMain' },
  { prefix: '/bank-cash/petty-cash', titleKey: 'pettyCash', groupKey: 'groupTransactions' },
  { prefix: '/bank-cash', titleKey: 'cashBank', groupKey: 'groupTransactions' },
  { prefix: '/sales', titleKey: 'sales', groupKey: 'groupTransactions' },
  { prefix: '/setting-budget', titleKey: 'sales', groupKey: 'groupTransactions' },
  { prefix: routes.baseModules.purchases, titleKey: 'purchases', groupKey: 'groupTransactions' },
  { prefix: '/finance/cost', titleKey: 'expenses', groupKey: 'groupTransactions' },
  { prefix: '/pending-changes', titleKey: 'pendingChanges', groupKey: 'groupTransactions' },
  { prefix: '/products', titleKey: 'products', groupKey: 'groupOperations' },
  { prefix: '/production', titleKey: 'production', groupKey: 'groupOperations' },
  { prefix: '/fulfillment', titleKey: 'fulfillment', groupKey: 'groupOperations' },
  {
    prefix: '/general-journal/detail-transaction-journal',
    titleKey: 'detailJournalTransaction',
    groupKey: 'groupGeneralJournal',
  },
  {
    prefix: '/general-journal/add-transaction-journal',
    titleKey: 'addJournalTransaction',
    groupKey: 'groupGeneralJournal',
  },
  {
    prefix: '/general-journal/detail-account-cb',
    titleKey: 'accountDetailCB',
    groupKey: 'groupGeneralJournal',
  },
  {
    prefix: '/general-journal/detail-account',
    titleKey: 'accountDetailNonCB',
    groupKey: 'groupGeneralJournal',
  },
  {
    prefix: '/general-journal/beginning-balance',
    titleKey: 'beginningBalance',
    groupKey: 'groupGeneralJournal',
  },
  { prefix: '/general-journal/add-account', titleKey: 'addAccount', groupKey: 'groupMasterData' },
  { prefix: '/general-journal/edit-account', titleKey: 'editAccount', groupKey: 'groupMasterData' },
  { prefix: '/general-journal', titleKey: 'chartOfAccounts', groupKey: 'groupMasterData' },
  { prefix: '/asset', titleKey: 'assets', groupKey: 'groupMasterData' },
  { prefix: '/contact', titleKey: 'contacts', groupKey: 'groupMasterData' },
  { prefix: '/settings/company-setting', titleKey: 'companySettings', groupKey: 'groupSettings' },
  { prefix: '/settings', titleKey: 'settings', groupKey: 'groupSettings' },
  { prefix: '/user-management', titleKey: 'userManagement', groupKey: 'groupSettings' },
  { prefix: '/profile', titleKey: 'profile', groupKey: 'groupAccount' },
];

const HeaderNav = ({
  desktopOpened: _desktopOpened,
  toggleMobile,
  mobileOpened,
}: HeaderNavProps) => {
  const { userName, clearTokens } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pendingQ = usePendingChangesCount();
  const pending = pendingQ.data ?? 0;
  const { currentLanguage, t } = useTranslation('navigation');

  const section = useMemo(() => {
    const matched = SECTION_DEFS.find((s) => pathname.startsWith(s.prefix));
    if (matched) {
      return {
        title: t(matched.titleKey),
        group: t(matched.groupKey),
      };
    }
    return { title: 'Jurnal', group: 'ProApps' };
  }, [pathname, t]);

  const displayName = capitalize(userName || 'Finance');
  const today = useMemo(() => {
    return new Intl.DateTimeFormat(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  }, [currentLanguage]);

  const handleLogout = () => {
    clearTokens();
    navigate(routes.login);
  };

  return (
    <Group justify="space-between" w="100%" h="100%" wrap="nowrap" gap="md">
      {/* Left: burger + section title */}
      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="md"
          size="sm"
          aria-label="Buka menu"
        />
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
        placeholder={
          currentLanguage === 'id'
            ? 'Cari akun, jurnal, kontak…'
            : 'Search accounts, journals, contacts…'
        }
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
        <LanguageSwitcher variant="compact" />

        <Group gap={6} className={classes.chip} visibleFrom="lg">
          <CalendarBlank size={16} weight="duotone" />
          <Text size="xs" fw={600} c="dark.6">
            {today}
          </Text>
        </Group>

        <Menu shadow="xl" width={220} radius="lg" position="bottom-end">
          <Menu.Target>
            <Tooltip label={t('quickCreate')} withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                variant="gradient"
                gradient={{ from: '#053079', to: '#09B2FF', deg: 135 }}
                className={classes.glow}
                aria-label={t('quickCreate')}
              >
                <Plus size={18} weight="bold" />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t('quickCreate')}</Menu.Label>
            <Menu.Item
              leftSection={<Notebook size={16} weight="duotone" />}
              onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
            >
              {t('journalTransactions')}
            </Menu.Item>
            <Menu.Item
              leftSection={<Bank size={16} weight="duotone" />}
              onClick={() => navigate(routes.BankAndCash.AddReceiveMoney)}
            >
              {currentLanguage === 'id' ? 'Terima Uang' : 'Receive Money'}
            </Menu.Item>
            <Menu.Item
              leftSection={<Bank size={16} weight="duotone" />}
              onClick={() => navigate(routes.BankAndCash.AddSentMoney)}
            >
              {currentLanguage === 'id' ? 'Kirim Uang' : 'Send Money'}
            </Menu.Item>
            <Menu.Item
              leftSection={<AddressBook size={16} weight="duotone" />}
              onClick={() => navigate(routes.Contact.Main)}
            >
              {t('contacts')}
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
              <ActionIcon
                size={38}
                radius="xl"
                variant="default"
                className={classes.iconBtn}
                aria-label={t('notifications')}
              >
                <Bell size={20} weight="duotone" />
              </ActionIcon>
            </Indicator>
          </Menu.Target>
          <Menu.Dropdown p="xs">
            <Group justify="space-between" px="xs" py={6}>
              <Text fw={700} size="sm">
                {t('notifications')}
              </Text>
              <Badge size="sm" variant="light" color={pending > 0 ? 'red' : 'gray'}>
                {pending} {currentLanguage === 'id' ? 'baru' : 'new'}
              </Badge>
            </Group>
            <Menu.Divider />
            {pending > 0 ? (
              <Menu.Item
                leftSection={<GearSix size={18} weight="duotone" />}
                onClick={() => navigate('/settings/approval-setting')}
              >
                <Text size="sm" fw={600}>
                  {pending}{' '}
                  {currentLanguage === 'id'
                    ? 'perubahan menunggu persetujuan'
                    : 'changes pending approval'}
                </Text>
                <Text size="xs" c="dimmed">
                  {currentLanguage === 'id'
                    ? 'Tinjau dan setujui agar jurnal tercatat.'
                    : 'Review and approve to record entries.'}
                </Text>
              </Menu.Item>
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="md">
                {currentLanguage === 'id'
                  ? 'Semua beres — tidak ada notifikasi.'
                  : 'All caught up — no notifications.'}
              </Text>
            )}
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="xl" width={220} radius="lg" position="bottom-end">
          <Menu.Target>
            <UnstyledButton className={classes.user} aria-label="Menu pengguna">
              <Group gap={8} wrap="nowrap">
                <Avatar
                  size={32}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: '#053079', to: '#09B2FF', deg: 135 }}
                >
                  {displayName.slice(0, 1)}
                </Avatar>
                <Box visibleFrom="sm" style={{ minWidth: 0 }}>
                  <Text fz={13} fw={700} c="dark.8" lh={1.1} truncate maw={120}>
                    {displayName}
                  </Text>
                  <Text fz={11} c="dimmed" lh={1.2}>
                    {t('activeAccount')}
                  </Text>
                </Box>
                <CaretDown size={14} weight="bold" color="var(--mantine-color-gray-5)" />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{displayName}</Menu.Label>
            <Menu.Item
              leftSection={<UserCircle size={16} weight="duotone" />}
              onClick={() => navigate(routes.profile)}
            >
              {t('profile')}
            </Menu.Item>
            <Menu.Item
              leftSection={<GearSix size={16} weight="duotone" />}
              onClick={() => navigate('/settings/company-setting')}
            >
              {t('settings')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<SignOut size={16} weight="duotone" />}
              onClick={handleLogout}
            >
              {t('logout')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default HeaderNav;
