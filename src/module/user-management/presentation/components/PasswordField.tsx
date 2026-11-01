import { Button, Group, List, PasswordInput, Stack, Text, ThemeIcon } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCheck, IconCopy, IconWand, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { generatePassword, passwordChecks } from '@/module/user-management/domain/userRules';

type Props = {
  value: string;
  label: string;
  error?: string;
  onChange: (value: string) => void;
};

/** Unbiased random integer in [0, max) from the browser's secure random source. */
const secureRandom = (max: number): number => {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
};

export function PasswordField({ value, label, error, onChange }: Readonly<Props>) {
  const { t } = useTranslation('userManagement');
  const clipboard = useClipboard({ timeout: 2000 });
  const checks = passwordChecks(value);

  const rules: Array<[boolean, string]> = [
    [checks.longEnough, t('userForm.ruleLength')],
    [checks.hasLetter, t('userForm.ruleLetter')],
    [checks.hasNumber, t('userForm.ruleNumber')],
  ];

  return (
    <Stack gap="xs">
      <PasswordInput
        label={label}
        withAsterisk
        autoComplete="new-password"
        value={value}
        error={error}
        onChange={(event) => onChange(event.currentTarget.value)}
        visibilityToggleButtonProps={{
          'aria-label': t('userForm.passwordShow'),
        }}
      />
      <Group gap="xs">
        <Button
          size="xs"
          variant="light"
          leftSection={<IconWand size={14} />}
          onClick={() => onChange(generatePassword(secureRandom))}
        >
          {t('userForm.passwordGenerate')}
        </Button>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconCopy size={14} />}
          disabled={value === ''}
          onClick={() => clipboard.copy(value)}
        >
          {clipboard.copied ? t('userForm.passwordCopied') : t('userForm.passwordCopy')}
        </Button>
      </Group>
      <List spacing={2} size="xs" center aria-live="polite">
        {rules.map(([ok, text]) => (
          <List.Item
            key={text}
            icon={
              <ThemeIcon size={16} radius="xl" color={ok ? 'green' : 'gray'} variant="light">
                {ok ? <IconCheck size={11} /> : <IconX size={11} />}
              </ThemeIcon>
            }
          >
            <Text span size="xs" c={ok ? 'green.8' : 'dimmed'}>
              {text}
            </Text>
          </List.Item>
        ))}
      </List>
      <Text size="xs" c="dimmed">
        {t('userForm.passwordNote')}
      </Text>
    </Stack>
  );
}
