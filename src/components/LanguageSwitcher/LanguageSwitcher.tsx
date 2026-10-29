import { Menu, UnstyledButton, Group, Text, Card, Stack, Badge, ThemeIcon } from '@mantine/core';
import { CaretDown, Check, Translate } from '@phosphor-icons/react';
import { notifications } from '@mantine/notifications';
import { useTranslation, AVAILABLE_LANGUAGES, SupportedLanguage } from '@/i18n';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'cards';
}

export const LanguageSwitcher = ({ variant = 'compact' }: LanguageSwitcherProps) => {
  const { currentLanguage, i18n, t } = useTranslation('settings');

  const handleSelectLanguage = (code: SupportedLanguage) => {
    if (code === currentLanguage) return;
    i18n.changeLanguage(code);
    notifications.show({
      title: code === 'id' ? 'Bahasa Berubah' : 'Language Changed',
      message:
        code === 'id'
          ? 'Sistem kini menggunakan Bahasa Indonesia.'
          : 'System is now set to English (US).',
      color: 'teal',
      icon: <Check size={18} weight="bold" />,
      autoClose: 3000,
    });
  };

  const activeLang =
    AVAILABLE_LANGUAGES.find((l) => l.code === currentLanguage) ?? AVAILABLE_LANGUAGES[0];

  if (variant === 'cards') {
    return (
      <Stack gap="md">
        <Group grow align="stretch">
          {AVAILABLE_LANGUAGES.map((item) => {
            const isSelected = item.code === currentLanguage;
            return (
              <Card
                key={item.code}
                withBorder
                padding="lg"
                radius="md"
                onClick={() => handleSelectLanguage(item.code)}
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
                  backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Group gap="sm">
                    <Text fz={28}>{item.flag}</Text>
                    <div>
                      <Group gap={6} align="center">
                        <Text fw={700} fz="md" c="dark.8">
                          {item.nativeLabel}
                        </Text>
                        <Badge size="xs" variant="light" color={isSelected ? 'blue' : 'gray'}>
                          {item.code.toUpperCase()}
                        </Badge>
                      </Group>
                      <Text fz="xs" c="dimmed">
                        {item.label}
                      </Text>
                    </div>
                  </Group>
                  {isSelected && (
                    <ThemeIcon radius="xl" size="sm" color="blue" variant="filled">
                      <Check size={14} weight="bold" />
                    </ThemeIcon>
                  )}
                </Group>
                <Text fz="xs" c="dimmed" mt={4}>
                  {item.code === 'id'
                    ? 'Format standar akuntansi PSAK Indonesia, nama akun & istilah dalam Bahasa Indonesia.'
                    : 'Standard IFRS / GAAP financial terminology, accounts & reporting in English.'}
                </Text>
              </Card>
            );
          })}
        </Group>
      </Stack>
    );
  }

  // Compact variant (HeaderNav)
  return (
    <Menu shadow="xl" width={220} radius="lg" position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '6px 10px',
            borderRadius: 24,
            border: '1px solid var(--mantine-color-gray-3)',
            backgroundColor: 'var(--mantine-color-white)',
            transition: 'all 0.15s ease',
          }}
          aria-label="Pilih bahasa / Select language"
        >
          <Group gap={6} wrap="nowrap">
            <Translate size={16} weight="duotone" color="var(--mantine-color-blue-6)" />
            <Text fz={13} fw={700} c="dark.7">
              {activeLang.flag} {activeLang.code.toUpperCase()}
            </Text>
            <CaretDown size={12} weight="bold" color="var(--mantine-color-gray-5)" />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('selectLanguage')}</Menu.Label>
        {AVAILABLE_LANGUAGES.map((item) => {
          const isSelected = item.code === currentLanguage;
          return (
            <Menu.Item
              key={item.code}
              onClick={() => handleSelectLanguage(item.code)}
              leftSection={<Text fz={16}>{item.flag}</Text>}
              rightSection={
                isSelected ? (
                  <Check size={14} weight="bold" color="var(--mantine-color-blue-6)" />
                ) : null
              }
              style={{
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
              }}
            >
              <Group gap="xs" wrap="nowrap">
                <Text size="sm">{item.nativeLabel}</Text>
                <Badge size="xs" variant="outline" color={isSelected ? 'blue' : 'gray'}>
                  {item.code.toUpperCase()}
                </Badge>
              </Group>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageSwitcher;
