import { List, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowsTransferDown, IconLock, IconRefresh, IconRotate2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

const ITEMS = [
  { key: 'lock', icon: IconLock, color: 'orange' },
  { key: 'journal', icon: IconArrowsTransferDown, color: 'primary' },
  { key: 'fresh', icon: IconRefresh, color: 'teal' },
  { key: 'undo', icon: IconRotate2, color: 'gray' },
] as const;

/** What closing does, beside every step, so the effect is never a surprise. */
export function ClosingAside() {
  const { t } = useTranslation('periodClosing');
  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <Text fw={700}>{t('wizard.aside.title')}</Text>
        <List spacing="sm" size="sm">
          {ITEMS.map(({ key, icon: Icon, color }) => (
            <List.Item
              key={key}
              icon={
                <ThemeIcon size={26} radius="xl" variant="light" color={color}>
                  <Icon size={14} />
                </ThemeIcon>
              }
            >
              {t(`wizard.aside.${key}`)}
            </List.Item>
          ))}
        </List>
      </Stack>
    </Paper>
  );
}
