import React from 'react';
import { ActionIcon, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface ReportSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** The search box of the report toolbar's `extra` slot, the same on every report page. */
export const ReportSearchInput: React.FC<ReportSearchInputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const { t } = useTranslation('reports');

  return (
    <TextInput
      size="sm"
      radius="md"
      placeholder={placeholder}
      aria-label={placeholder}
      leftSection={<IconSearch size={15} />}
      rightSection={
        value ? (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            aria-label={t('common.resetSearch')}
            onClick={() => onChange('')}
          >
            <IconX size={14} />
          </ActionIcon>
        ) : null
      }
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      w={{ base: '100%', xs: 280 }}
    />
  );
};
