import { Button, CopyButton, TextInput, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface CopyIdFieldProps {
  label: string;
  value?: string;
}

export function CopyIdField({ label, value }: CopyIdFieldProps) {
  const { t } = useTranslation('profile');

  return (
    <TextInput
      label={label}
      value={value || t('emptyValue')}
      readOnly
      leftSection={<IconInfoCircle size={18} />}
      rightSection={
        value ? (
          <CopyButton value={value} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t('copyField.copied') : t('copyField.copy')} withArrow>
                <Button variant="subtle" color="gray" size="xs" p={4} onClick={copy}>
                  {copied ? <IconCheck size={16} color="teal" /> : <IconCopy size={16} />}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
        ) : null
      }
      styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)' } }}
    />
  );
}
