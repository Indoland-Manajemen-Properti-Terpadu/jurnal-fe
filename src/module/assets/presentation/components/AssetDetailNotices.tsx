import type { ReactNode } from 'react';
import { Box, Button, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconCircleCheck, IconClockHour4, type Icon } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type Tone = 'warning';

const TONE: Record<Tone, { bg: string; border: string; color: string }> = {
  warning: {
    bg: 'var(--mantine-color-yellow-0)',
    border: 'var(--mantine-color-yellow-2)',
    color: 'yellow',
  },
};

type AssetNoticeProps = {
  tone: Tone;
  icon: Icon;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
};

/** A calm banner: icon, an optional bold title, the message, and one optional action on the right. */
function AssetNotice({
  tone,
  icon: NoticeIcon,
  title,
  children,
  action,
}: Readonly<AssetNoticeProps>) {
  const palette = TONE[tone];
  return (
    <Paper
      radius="lg"
      p="md"
      style={{ backgroundColor: palette.bg, border: `1px solid ${palette.border}` }}
    >
      <Group justify="space-between" align="center" gap="md" wrap="wrap">
        <Group gap="sm" align="center" wrap="nowrap" style={{ flex: 1, minWidth: 260 }}>
          <ThemeIcon size={36} radius="md" variant="light" color={palette.color}>
            <NoticeIcon size={20} stroke={1.8} />
          </ThemeIcon>
          <Box>
            {title && (
              <Text fw={700} size="sm" c="dark.9" lh={1.3}>
                {title}
              </Text>
            )}
            <Text size="sm" c="dark.7" lh={1.45}>
              {children}
            </Text>
          </Box>
        </Group>
        {action}
      </Group>
    </Paper>
  );
}

/** Pending assets are not in the books yet; this is where they get activated. */
export function AssetPendingNotice({ onActivate }: Readonly<{ onActivate: () => void }>) {
  const { t } = useTranslation('assets');
  return (
    <AssetNotice
      tone="warning"
      icon={IconClockHour4}
      title={t('pendingNoticeTitle')}
      action={
        <Button
          size="md"
          radius="md"
          leftSection={<IconCircleCheck size={18} />}
          onClick={onActivate}
        >
          {t('activateAction')}
        </Button>
      }
    >
      {t('pendingNoticeBody')}
    </AssetNotice>
  );
}
