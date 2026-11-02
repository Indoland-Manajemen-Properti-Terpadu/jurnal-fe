import { ActionIcon, CopyButton, TextInput, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconHash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface CopyIdFieldProps {
  label: string;
  value?: string;
}

export function CopyIdField({ label, value }: Readonly<CopyIdFieldProps>) {
  const { t } = useTranslation('profile');

  return (
    <TextInput
      label={label}
      value={value || t('emptyValue')}
      readOnly
      leftSection={<IconHash size={16} />}
      rightSection={
        value ? (
          <CopyButton value={value} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t('copyField.copied') : t('copyField.copy')} withArrow>
                <ActionIcon
                  variant="subtle"
                  color={copied ? 'teal' : 'gray'}
                  size="sm"
                  onClick={copy}
                  aria-label={copied ? t('copyField.copied') : t('copyField.copy')}
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        ) : null
      }
      styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)' } }}
    />
  );
}
