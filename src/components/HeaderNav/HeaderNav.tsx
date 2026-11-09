import { useMemo } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Indicator,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import {
  Bell,
  CalendarBlank,
  CaretDown,
  GearSix,
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
import { resolveSectionTitle } from '@/components/Navbar/navigationRegistry';
import classes from '@/components/HeaderNav/HeaderNav.module.css';

type HeaderNavProps = {
  mobileOpened?: boolean;
  toggleMobile?: () => void;
  desktopOpened?: boolean;
  toggleDesktop?: () => void;
};

const HeaderNav = ({ toggleMobile, mobileOpened }: HeaderNavProps) => {
  const { userName, clearTokens } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pendingQ = usePendingChangesCount();
  const pending = pendingQ.data ?? 0;
  const { currentLanguage, t } = useTranslation('navigation');

  const section = useMemo(() => {
    const matched = resolveSectionTitle(pathname);
    if (matched) {
      return {
        title: t(matched.titleKey),
        group: t(matched.groupKey),
      };
    }
    return { title: 'Jurnal', group: 'ProApps' };
  }, [pathname, t]);

  const displayName = capitalize(userName || 'Finance');
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [currentLanguage]
  );

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
          aria-label={t('openMenu')}
        />
        <Box style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.8} visibleFrom="xs">
            {section.group}
          </Text>
          <Text fw={700} fz={{ base: 'sm', sm: 'lg' }} c="dark.8" lh={1.2} truncate>
            {section.title}
          </Text>
        </Box>
      </Group>

      {/* Right: actions */}
      <Group gap={8} wrap="nowrap">
        <LanguageSwitcher variant="compact" />

        <Group gap={6} className={classes.chip} visibleFrom="lg">
          <CalendarBlank size={16} weight="duotone" />
          <Text size="xs" fw={600} c="dark.6">
            {today}
          </Text>
        </Group>

        <Menu shadow="md" width={220} radius="lg" position="bottom-end">
          <Menu.Target>
            <Tooltip label={t('quickCreate')} withArrow>
              <ActionIcon
                size={36}
                radius="md"
                variant="filled"
                color="primary"
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
              onClick={() => navigate(routes.journalEntries.add)}
            >
              {t('journalTransactions')}
            </Menu.Item>
            <Menu.Item
              leftSection={<Bank size={16} weight="duotone" />}
              onClick={() => navigate(routes.bankCash.addReceive)}
            >
              {currentLanguage === 'id' ? 'Terima Uang' : 'Receive Money'}
            </Menu.Item>
            <Menu.Item
              leftSection={<Bank size={16} weight="duotone" />}
              onClick={() => navigate(routes.bankCash.addSent)}
            >
              {currentLanguage === 'id' ? 'Kirim Uang' : 'Send Money'}
            </Menu.Item>
            <Menu.Item
              leftSection={<AddressBook size={16} weight="duotone" />}
              onClick={() => navigate(routes.contacts.main)}
            >
              {t('contacts')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" width={300} radius="lg" position="bottom-end">
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
                size={36}
                radius="md"
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
                onClick={() => navigate(routes.pendingChanges.main)}
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

        <Menu shadow="md" width={220} radius="lg" position="bottom-end">
          <Menu.Target>
            <UnstyledButton className={classes.user} aria-label={t('userMenu')}>
              <Group gap={8} wrap="nowrap">
                <Avatar size={32} radius="md" variant="light" color="primary">
                  {displayName.slice(0, 1)}
                </Avatar>
                <Box visibleFrom="sm" style={{ minWidth: 0 }}>
                  <Text fz="var(--jurnal-text-sm)" fw={700} c="dark.8" lh={1.1} truncate maw={120}>
                    {displayName}
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
