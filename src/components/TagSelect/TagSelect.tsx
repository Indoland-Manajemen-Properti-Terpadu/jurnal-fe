import { useState } from 'react';
import {
  ActionIcon,
  CheckIcon,
  Combobox,
  Group,
  Input,
  Loader,
  Pill,
  PillsInput,
  ScrollArea,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { IconPlus, IconTag } from '@tabler/icons-react';

export type TagSelectOption = { value: string; label: string };

type TagSelectProps = {
  label: string;
  placeholder: string;
  /** Shown when no tag matches what was typed. */
  emptyText: string;
  addPlaceholder: string;
  addLabel: string;
  options: TagSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Creates a tag and returns its id (null when it could not be created). */
  onCreate: (name: string) => Promise<string | null>;
  isLoading?: boolean;
  isCreating?: boolean;
  error?: React.ReactNode;
};

/** Pick existing tags or add a new one from the dropdown's footer. */
export function TagSelect({
  label,
  placeholder,
  emptyText,
  addPlaceholder,
  addLabel,
  options,
  value,
  onChange,
  onCreate,
  isLoading,
  isCreating,
  error,
}: Readonly<TagSelectProps>) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  const remove = (id: string) => onChange(value.filter((item) => item !== id));

  const create = async () => {
    const name = draft.trim();
    if (!name || isCreating) return;
    const id = await onCreate(name);
    if (id) {
      onChange([...value, id]);
      setDraft('');
    }
  };

  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Input.Wrapper label={label} error={error}>
      <Combobox store={combobox} onOptionSubmit={toggle} withinPortal>
        <Combobox.DropdownTarget>
          <PillsInput
            mt={4}
            error={Boolean(error)}
            onClick={() => combobox.openDropdown()}
            rightSection={<IconTag size={16} color="var(--mantine-color-gray-5)" />}
          >
            <Pill.Group>
              {value.map((id) => (
                <Pill key={id} withRemoveButton onRemove={() => remove(id)}>
                  {options.find((option) => option.value === id)?.label ?? id}
                </Pill>
              ))}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  aria-label={label}
                  placeholder={value.length === 0 ? placeholder : ''}
                  value={search}
                  onFocus={() => combobox.openDropdown()}
                  onChange={(event) => {
                    combobox.updateSelectedOptionIndex();
                    setSearch(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && search.length === 0 && value.length > 0) {
                      event.preventDefault();
                      remove(value[value.length - 1]);
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
              {isLoading && (
                <Combobox.Empty>
                  <Loader size="sm" />
                </Combobox.Empty>
              )}
              {!isLoading && visible.length === 0 && <Combobox.Empty>{emptyText}</Combobox.Empty>}
              {!isLoading &&
                visible.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    value={option.value}
                    active={value.includes(option.value)}
                  >
                    <Group gap="sm">
                      {value.includes(option.value) ? <CheckIcon size={12} /> : null}
                      <span>{option.label}</span>
                    </Group>
                  </Combobox.Option>
                ))}
            </ScrollArea.Autosize>
          </Combobox.Options>

          <Combobox.Footer>
            <Group gap="xs" p="xs" wrap="nowrap">
              <TextInput
                size="xs"
                style={{ flex: 1 }}
                placeholder={addPlaceholder}
                aria-label={addPlaceholder}
                value={draft}
                data-combobox-ignore
                onChange={(event) => setDraft(event.currentTarget.value)}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    create();
                  }
                }}
              />
              <ActionIcon
                variant="light"
                color="primary"
                aria-label={addLabel}
                data-combobox-ignore
                loading={isCreating}
                disabled={!draft.trim()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  create();
                }}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Combobox.Footer>
        </Combobox.Dropdown>
      </Combobox>
    </Input.Wrapper>
  );
}

export default TagSelect;
