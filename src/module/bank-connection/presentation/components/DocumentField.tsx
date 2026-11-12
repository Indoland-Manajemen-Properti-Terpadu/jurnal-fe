import { useRef } from 'react';
import { ActionIcon, Anchor, Button, Group, Stack, Text } from '@mantine/core';
import { IconFileText, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatFileSize } from '@/utils/formatFileSize';
import { ACCEPTED_DOCUMENT_TYPES } from '@/module/bank-connection/domain/connectionDocuments';

/** One document the bank asks for: what it is, a button to attach it, the chosen file, and why it is refused. */
export function DocumentField({
  label,
  help,
  buttonLabel,
  file,
  held,
  error,
  onChange,
  onSeeExample,
}: Readonly<{
  label: string;
  help: string;
  buttonLabel: string;
  file: File | null;
  /** File name the backend already holds for this document (a request sent back). */
  held?: string;
  error?: string;
  onChange: (file: File | null) => void;
  /** Opens an example of the document; the link is shown only when given. */
  onSeeExample?: () => void;
}>) {
  const { t } = useTranslation('bankConnection');
  const input = useRef<HTMLInputElement>(null);

  return (
    <Stack gap={6}>
      <Group justify="space-between" wrap="nowrap">
        <Text fz="sm" fw={500}>
          {label}
        </Text>
        {onSeeExample && (
          <Anchor component="button" type="button" fz="sm" onClick={onSeeExample}>
            {t('form.documents.example')}
          </Anchor>
        )}
      </Group>
      <Text fz={12} c="dimmed">
        {help}
      </Text>
      <input
        ref={input}
        type="file"
        hidden
        aria-label={label}
        accept={ACCEPTED_DOCUMENT_TYPES.join(',')}
        onChange={(event) => {
          const chosen = event.currentTarget.files?.[0] ?? null;
          if (chosen) onChange(chosen);
          event.currentTarget.value = '';
        }}
      />
      {file ? (
        <Group
          justify="space-between"
          wrap="nowrap"
          p="xs"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 'var(--mantine-radius-md)',
          }}
        >
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <IconFileText size={20} color="var(--mantine-color-dimmed)" />
            <div style={{ minWidth: 0 }}>
              <Text fz="sm" fw={500} truncate>
                {file.name}
              </Text>
              <Text fz={12} c="dimmed">
                {formatFileSize(file.size)}
              </Text>
            </div>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onChange(null)}
            aria-label={t('form.documents.remove', { name: file.name })}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ) : (
        <Group gap="sm">
          {held && <Text fz="sm">{t('form.documents.attached', { name: held })}</Text>}
          <Button
            variant="default"
            size="xs"
            leftSection={held ? undefined : <IconPlus size={14} />}
            onClick={() => input.current?.click()}
          >
            {held ? t('form.documents.replace') : buttonLabel}
          </Button>
        </Group>
      )}
      <Text fz={12} c="dimmed">
        {t('form.documents.limit')}
      </Text>
      {error && (
        <Text fz={12} c="red" role="alert">
          {error}
        </Text>
      )}
    </Stack>
  );
}
