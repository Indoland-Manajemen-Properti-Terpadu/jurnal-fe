import React, { useState } from 'react';
import {
  Combobox,
  Group,
  Pill,
  PillsInput,
  CheckIcon,
  useCombobox,
  ActionIcon,
  TextInput,
  Loader,
  ScrollArea,
} from '@mantine/core';
import { IconTag, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';
import { useGetTags, useCreateTag } from '../hooks/useTags';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TagInput({ value, onChange }: TagInputProps) {
  const { t } = useTranslation('journalEntries');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const [search, setSearch] = useState('');
  const [newTagValue, setNewTagValue] = useState('');

  const { data: tagsData, isLoading } = useGetTags();
  const createTagMutation = useCreateTag();

  const handleValueSelect = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const handleValueRemove = (val: string) => onChange(value.filter((v) => v !== val));

  const allTags = tagsData?.data?.data || [];

  const values = value.map((item) => {
    const tag = allTags.find((tag2) => tag2.id === item);
    return (
      <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
        {tag?.name || item}
      </Pill>
    );
  });

  const options = allTags
    .filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
    .map((item) => (
      <Combobox.Option value={item.id} key={item.id} active={value.includes(item.id)}>
        <Group gap="sm">
          {value.includes(item.id) ? <CheckIcon size={12} /> : null}
          <span>{item.name}</span>
        </Group>
      </Combobox.Option>
    ));

  const handleCreateTag = async () => {
    if (newTagValue.trim()) {
      try {
        const result = await createTagMutation.mutateAsync(newTagValue.trim());
        if (result.data?.id) {
          onChange([...value, result.data.id]);
          setNewTagValue('');
        }
      } catch {
        // Error handled by mutation
      }
    }
  };

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          rightSection={<IconTag size={16} color={themeColors.gray[5]} />}
          styles={{
            input: {
              minHeight: 38,
              // maxWidth: '70%',
            },
          }}
        >
          <Pill.Group>
            {values}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                value={search}
                placeholder={value.length === 0 ? t('tags.placeholder') : ''}
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={200} type="scroll">
            {isLoading ? (
              <Combobox.Empty>
                <Loader size="sm" />
              </Combobox.Empty>
            ) : options && options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>{t('tags.noTags')}</Combobox.Empty>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>

        <Combobox.Footer>
          <Group gap="xs" p="xs" wrap="nowrap">
            <TextInput
              placeholder={t('tags.addPlaceholder')}
              value={newTagValue}
              onChange={(event) => setNewTagValue(event.currentTarget.value)}
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleCreateTag();
                }
              }}
              onClick={(event) => event.stopPropagation()}
              data-combobox-ignore
              size="xs"
              style={{ flex: 1 }}
            />
            <ActionIcon
              variant="light"
              color="primary"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                handleCreateTag();
              }}
              loading={createTagMutation.isPending}
              disabled={!newTagValue.trim()}
              data-combobox-ignore
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </Combobox.Footer>
      </Combobox.Dropdown>
    </Combobox>
  );
}
