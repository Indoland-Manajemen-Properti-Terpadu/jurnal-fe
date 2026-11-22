import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, type Icon } from '@tabler/icons-react';
import classes from '@/module/purchases/presentation/components/shared/SourcePickerDialog.module.css';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

export interface SourceOption {
  id: string;
  number: string;
  /** Under the number: the vendor or the purpose. */
  line: string;
  /** A second dimmed line: the document it came from. */
  sub?: string;
  /** Right aligned: the amount or the route. */
  trailing?: string;
}

interface SourcePickerDialogProps {
  opened: boolean;
  onClose: () => void;
  icon?: Icon;
  title: string;
  description: string;
  searchPlaceholder: string;
  emptyText: string;
  options: SourceOption[];
  isLoading: boolean;
  isError: boolean;
  /** Called with the typed words after a short pause, to search on the server. */
  onSearch: (search: string) => void;
  onPick: (id: string) => void;
}

/**
 * "Pilih dokumen yang akan dilanjutkan": a search box and one card per document that can start the
 * next one, as in the reference web. A card is the whole click target, there is no button.
 */
export const SourcePickerDialog = ({
  opened,
  onClose,
  title,
  description,
  searchPlaceholder,
  emptyText,
  options,
  isLoading,
  isError,
  onSearch,
  onPick,
}: Readonly<SourcePickerDialogProps>) => {
  const { t } = useTranslation('purchases');
  const [input, setInput] = useState('');
  const [debounced] = useDebouncedValue(input, 350);
  const latest = useRef(onSearch);
  latest.current = onSearch;
  useEffect(() => {
    latest.current(debounced.trim());
  }, [debounced]);

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      size="min(640px, 94vw)"
      title={title}
      description={description}
      scrollBody
      headerExtra={
        <TextInput
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          radius="md"
          data-autofocus
        />
      }
      footer={
        <Button variant="default" onClick={onClose}>
          {t('common.cancel')}
        </Button>
      }
    >
      {isLoading && (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      )}
      {isError && (
        <Text size="sm" c="red.7">
          {t('list.errorDescription')}
        </Text>
      )}
      {!isLoading && !isError && options.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="md">
          {emptyText}
        </Text>
      )}
      <Stack gap="sm">
        {options.map((option) => (
          <UnstyledButton
            key={option.id}
            className={classes.trigger}
            onClick={() => onPick(option.id)}
            aria-label={`${title} ${option.number}`}
          >
            <Paper withBorder radius="md" p="md" bg="white" className={classes.card}>
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                <div style={{ minWidth: 0 }}>
                  <Text size="sm" fw={700} c="primary.8">
                    {option.number}
                  </Text>
                  <Text size="sm" c="dark.6">
                    {option.line}
                  </Text>
                  {option.sub && (
                    <Text size="xs" c="dimmed">
                      {option.sub}
                    </Text>
                  )}
                </div>
                {option.trailing && (
                  <Text
                    size="sm"
                    fw={700}
                    style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {option.trailing}
                  </Text>
                )}
              </Group>
            </Paper>
          </UnstyledButton>
        ))}
      </Stack>
    </ModalFrame>
  );
};
