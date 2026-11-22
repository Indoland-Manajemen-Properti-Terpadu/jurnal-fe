import type { ReactNode } from 'react';
import {
  ActionIcon,
  Anchor,
  Box,
  CopyButton,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconDotsVertical,
  type Icon,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useTranslation } from '@/i18n';

export interface FrameMenuItem {
  label: string;
  icon: Icon;
  onClick: () => void;
  danger?: boolean;
}

interface DetailFrameProps {
  icon: Icon;
  title: string;
  /** Offer a copy button next to a document number. */
  copyable?: boolean;
  /** Status badges after the title. */
  badges?: ReactNode;
  /** One line under the title: date, warehouse, route. */
  subtitle?: ReactNode;
  backTo: string;
  backLabel: string;
  /** Go back in history instead of to `backTo` (a page reached from several places). */
  onBack?: () => void;
  /** The buttons on the right; at most one filled. */
  actions?: ReactNode;
  /** Less frequent or risky actions, behind the "more" button. */
  menu?: FrameMenuItem[];
  children: ReactNode;
}

/** A back link to the list. Every inventory detail and form page opens with it. */
export const BackLink = ({
  to,
  label,
  onBack,
}: Readonly<{ to: string; label: string; onBack?: () => void }>) => {
  const content = (
    <Group gap={6} wrap="nowrap">
      <IconArrowLeft size={16} />
      {label}
    </Group>
  );
  return onBack ? (
    <Anchor
      component="button"
      type="button"
      onClick={onBack}
      size="sm"
      c="dimmed"
      fw={500}
      style={{ alignSelf: 'flex-start' }}
    >
      {content}
    </Anchor>
  ) : (
    <Anchor
      component={Link}
      to={to}
      size="sm"
      c="dimmed"
      fw={500}
      style={{ alignSelf: 'flex-start' }}
    >
      {content}
    </Anchor>
  );
};

/** The page around a detail: shell, padding, the back link and the cards. */
export const PageFrame = ({
  backTo,
  backLabel,
  onBack,
  children,
}: Readonly<{ backTo?: string; backLabel?: string; onBack?: () => void; children: ReactNode }>) => (
  <AppShellLayout>
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        {backTo && backLabel && <BackLink to={backTo} label={backLabel} onBack={onBack} />}
        {children}
      </Stack>
    </Box>
  </AppShellLayout>
);

/**
 * The shell of every inventory detail page, as in the reference web and Purchasing: a back link,
 * one header card (icon, title, status, one line of context, actions), and the cards below it.
 */
export const DetailFrame = ({
  icon: HeaderIcon,
  title,
  copyable,
  badges,
  subtitle,
  backTo,
  backLabel,
  onBack,
  actions,
  menu,
  children,
}: Readonly<DetailFrameProps>) => {
  const { t } = useTranslation('warehouses');
  return (
    <PageFrame backTo={backTo} backLabel={backLabel} onBack={onBack}>
      <Paper withBorder radius="lg" p="lg" bg="white">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon size={52} radius="md" color="primary" variant="light">
              <HeaderIcon size={26} stroke={1.8} />
            </ThemeIcon>
            <div style={{ minWidth: 0 }}>
              <Group gap="xs" wrap="wrap" align="center">
                <Text component="h1" fz={{ base: 22, sm: 26 }} fw={700} lh={1.2} m={0}>
                  {title}
                </Text>
                {copyable && (
                  <CopyButton value={title} timeout={1500}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? t('frame.copied') : t('frame.copy')} withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={copy}
                          aria-label={t('frame.copy')}
                        >
                          {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                )}
                {badges}
              </Group>
              {subtitle && (
                <Text size="sm" c="dimmed" mt={4} component="div">
                  {subtitle}
                </Text>
              )}
            </div>
          </Group>
          {(actions || (menu && menu.length > 0)) && (
            <Group gap="sm" wrap="wrap" justify="flex-end">
              {actions}
              {menu && menu.length > 0 && (
                <Menu position="bottom-end" withinPortal shadow="md" radius="md">
                  <Menu.Target>
                    <ActionIcon
                      variant="default"
                      size={36}
                      radius="md"
                      aria-label={t('frame.more', { name: title })}
                    >
                      <IconDotsVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {menu.map(({ label, icon: ItemIcon, onClick, danger }) => (
                      <Menu.Item
                        key={label}
                        color={danger ? 'red' : undefined}
                        leftSection={<ItemIcon size={16} />}
                        onClick={onClick}
                      >
                        {label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          )}
        </Group>
      </Paper>
      {children}
    </PageFrame>
  );
};

/** The header card of a form: icon, title and what the form does. */
export const FormHeader = ({
  icon: HeaderIcon,
  title,
  description,
}: Readonly<{ icon: Icon; title: string; description: string }>) => (
  <Paper withBorder radius="lg" p="lg" bg="white">
    <Group gap="md" wrap="nowrap" align="flex-start">
      <ThemeIcon size={52} radius="md" color="primary" variant="light">
        <HeaderIcon size={26} stroke={1.8} />
      </ThemeIcon>
      <div>
        <Text component="h1" fz={{ base: 22, sm: 26 }} fw={700} lh={1.2} m={0}>
          {title}
        </Text>
        <Text size="sm" c="dimmed" mt={4} maw={760}>
          {description}
        </Text>
      </div>
    </Group>
  </Paper>
);

/** A muted dash for a cell with nothing in it. */
export const Dash = () => (
  <Text size="sm" c="dimmed" component="span">
    —
  </Text>
);
