import { ActionIcon, Badge, Box, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import {
  IconCircleFilled,
  IconDotsVertical,
  IconExternalLink,
  IconHelpCircle,
  IconLock,
  IconShieldCheck,
} from '@tabler/icons-react';
import classes from './FooterNav.module.css';

const FOOTER_LINKS = [
  { label: 'Bantuan & Dokumen', icon: IconHelpCircle, href: '#' },
  { label: 'Pusat Keamanan', icon: IconShieldCheck, href: '#' },
  { label: 'Ketentuan Layanan', icon: IconLock, href: '#' },
];

export const FooterNav = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Group justify="space-between" align="center" w="100%" h="100%" wrap="nowrap" gap="md">
      {/* Left: Brand copyright & System status badge */}
      <Group gap="sm" wrap="nowrap">
        <Text fz="var(--jurnal-text-xs)" fw={500} c="dimmed">
          &copy; {currentYear}{' '}
          <Text span fw={700} c="primary.9">
            ProApps
          </Text>{' '}
          · Jurnal Accounting
        </Text>
        <Badge
          variant="light"
          color="teal"
          size="sm"
          radius="xl"
          leftSection={<IconCircleFilled size={7} />}
          visibleFrom="sm"
          styles={{
            root: { textTransform: 'none', fontWeight: 600, paddingLeft: 8, paddingRight: 10 },
          }}
        >
          Sistem Online
        </Badge>
      </Group>

      {/* Right: Quick helpful links & Mobile menu */}
      <Group gap="xs" wrap="nowrap">
        {/* Desktop links */}
        <Group gap={4} visibleFrom="sm" wrap="nowrap">
          {FOOTER_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <UnstyledButton
                key={link.label}
                className={classes.footerLink}
                component="a"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                <Group gap={6} wrap="nowrap">
                  <Icon size={14} className={classes.linkIcon} />
                  <span>{link.label}</span>
                </Group>
              </UnstyledButton>
            );
          })}
        </Group>

        {/* System Version Tag */}
        <Box className={classes.versionTag} visibleFrom="md">
          v2.4.0-stable
        </Box>

        {/* Mobile menu */}
        <Box hiddenFrom="sm">
          <Menu shadow="xl" width={200} position="top-end" radius="md">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                radius="md"
                aria-label="Footer Menu"
              >
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Bantuan & Kebijakan</Menu.Label>
              {FOOTER_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Menu.Item
                    key={link.label}
                    leftSection={<Icon size={14} />}
                    rightSection={<IconExternalLink size={12} color="gray" />}
                    component="a"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </Menu.Item>
                );
              })}
              <Menu.Divider />
              <Box px="xs" py={4}>
                <Text size="xs" c="dimmed">
                  Status:{' '}
                  <Text span c="teal.7" fw={600}>
                    Online (v2.4.0)
                  </Text>
                </Text>
              </Box>
            </Menu.Dropdown>
          </Menu>
        </Box>
      </Group>
    </Group>
  );
};

export default FooterNav;
