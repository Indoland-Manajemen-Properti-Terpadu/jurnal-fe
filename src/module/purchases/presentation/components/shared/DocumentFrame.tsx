import type { ReactNode } from 'react';
import {
  ActionIcon,
  Anchor,
  Box,
  CopyButton,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconArrowLeft, IconCheck, IconCopy, IconInfoCircle, type Icon } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useTranslation } from '@/i18n';
import { useDashboardConfig } from '@/module/purchases/presentation/hooks/useDashboard';
import classes from '@/module/purchases/presentation/components/shared/DocumentFrame.module.css';

export interface FrameFact {
  icon: Icon;
  label: string;
  value: ReactNode;
  /** A second dimmed line under the value. */
  sub?: string;
}

interface DocumentFrameProps {
  icon: Icon;
  /** The document number, shown large with a copy button. */
  number: string;
  /** Status badges after the number. */
  badges?: ReactNode;
  /** The document date, under the number. */
  date: string;
  backTo: string;
  /** "Kembali ke daftar pesanan". */
  backLabel: string;
  /** Buttons on the right of the header. */
  actions?: ReactNode;
  /** Who the document waits for, when this user cannot act on it: "Menunggu verifikasi Accounting". */
  waiting?: string;
  /** A line on the right above the actions, for example who pays. */
  meta?: ReactNode;
  /** Key facts under the header, each with its own icon tile. */
  facts?: FrameFact[];
  children: ReactNode;
}

/**
 * The shell of every document detail page of purchasing, as in the reference web: a back link, one
 * header card (icon, number with copy button, status, date, actions) with an optional strip of key
 * facts, and the cards below it.
 */
export const DocumentFrame = ({
  icon: HeaderIcon,
  number,
  badges,
  date,
  backTo,
  backLabel,
  actions,
  waiting,
  meta,
  facts,
  children,
}: Readonly<DocumentFrameProps>) => {
  const navigate = useNavigate();
  const { t } = useTranslation('purchases');
  useDashboardConfig();
  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <Anchor
            component="button"
            type="button"
            size="sm"
            c="dimmed"
            fw={500}
            onClick={() => navigate(backTo)}
            style={{ alignSelf: 'flex-start' }}
          >
            <Group gap={6} wrap="nowrap">
              <IconArrowLeft size={16} />
              {backLabel}
            </Group>
          </Anchor>

          <Paper withBorder radius="lg" p={0} bg="white" style={{ overflow: 'hidden' }}>
            <Group justify="space-between" align="center" wrap="wrap" gap="md" p="lg">
              <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon size={52} radius="md" color="primary" variant="filled">
                  <HeaderIcon size={26} stroke={1.8} />
                </ThemeIcon>
                <div style={{ minWidth: 0 }}>
                  <Group gap="sm" wrap="wrap" align="center">
                    <Text component="h1" fz={{ base: 22, sm: 28 }} fw={700} lh={1.2} m={0}>
                      {number}
                    </Text>
                    <CopyButton value={number} timeout={1500}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? t('common.copied') : t('common.copy')} withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={copy}
                            aria-label={t('common.copy')}
                          >
                            {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                    {badges}
                  </Group>
                  <Text size="md" c="dimmed" mt={2}>
                    {date}
                  </Text>
                </div>
              </Group>
              {(actions || meta || waiting) && (
                <Stack gap="xs" align="flex-end">
                  {meta}
                  {waiting && (
                    <Group
                      gap={8}
                      wrap="nowrap"
                      px="md"
                      py={8}
                      style={{
                        border: '1px solid var(--mantine-color-orange-3)',
                        borderRadius: 'var(--mantine-radius-md)',
                        background: 'var(--mantine-color-orange-0)',
                      }}
                    >
                      <IconInfoCircle size={16} color="var(--mantine-color-orange-7)" />
                      <Text size="sm" c="orange.9">
                        {waiting}
                      </Text>
                    </Group>
                  )}
                  {actions && (
                    <Group gap="sm" wrap="wrap" justify="flex-end">
                      {actions}
                    </Group>
                  )}
                </Stack>
              )}
            </Group>
            {facts && facts.length > 0 && (
              <div className={classes.facts}>
                {facts.map(({ icon: FactIcon, label, value, sub }) => (
                  <div key={label} className={classes.fact}>
                    <ThemeIcon size={40} radius="md" color="primary" variant="light">
                      <FactIcon size={20} stroke={1.8} />
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Text fz="xs" c="dimmed" fw={500}>
                        {label}
                      </Text>
                      <Text fz="md" fw={700} lh={1.3} className={classes.value}>
                        {value}
                      </Text>
                      {sub && (
                        <Text fz="xs" c="dimmed">
                          {sub}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Paper>

          {children}
        </Stack>
      </Box>
    </AppShellLayout>
  );
};
