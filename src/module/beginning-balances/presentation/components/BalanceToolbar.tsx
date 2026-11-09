import React from 'react';
import { ActionIcon, Button, Group, Select, Stack, Switch, Text, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconRotate, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8];

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  accountClass: number | null;
  onAccountClassChange: (value: number | null) => void;
  onlyFilled: boolean;
  onOnlyFilledChange: (value: boolean) => void;
  selectedDate: string | null;
  onDateChange: (value: string | null) => void;
  dateError?: string | null;
  maxDate?: string | Date;
  shownCount: number;
  accountCount: number;
  canReset: boolean;
  onReset: () => void;
};

const BalanceToolbar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  accountClass,
  onAccountClassChange,
  onlyFilled,
  onOnlyFilledChange,
  selectedDate,
  onDateChange,
  dateError,
  maxDate,
  shownCount,
  accountCount,
  canReset,
  onReset,
}) => {
  const { t } = useTranslation('beginningBalances');
  const hasFilter = Boolean(searchQuery) || accountClass !== null || onlyFilled;

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="md" style={{ flex: 1, minWidth: 280 }} wrap="wrap">
          <TextInput
            aria-label={t('toolbar.search')}
            placeholder={t('toolbar.search')}
            size="sm"
            radius="md"
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={() => onSearchChange('')}
                  aria-label={t('toolbar.clearSearch')}
                >
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
            value={searchQuery}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            style={{ flex: 1, minWidth: 220, maxWidth: 320 }}
          />

          <Select
            aria-label={t('toolbar.classFilter')}
            placeholder={t('toolbar.classFilter')}
            size="sm"
            radius="md"
            data={[
              { value: 'all', label: t('toolbar.allClasses') },
              ...CLASSES.map((digit) => ({
                value: String(digit),
                label: t(`accountClass.${digit}`),
              })),
            ]}
            value={accountClass === null ? 'all' : String(accountClass)}
            onChange={(value) =>
              onAccountClassChange(!value || value === 'all' ? null : Number(value))
            }
            allowDeselect={false}
            style={{ width: 220 }}
          />

          <Switch
            label={t('toolbar.onlyFilled')}
            checked={onlyFilled}
            onChange={(event) => onOnlyFilledChange(event.currentTarget.checked)}
          />
        </Group>

        <Group gap="sm" wrap="wrap">
          <DatePickerInput
            aria-label={t('toolbar.conversionDate')}
            placeholder={t('toolbar.conversionDate')}
            valueFormat="DD/MM/YYYY"
            size="sm"
            radius="md"
            leftSection={<IconCalendar size={16} />}
            value={selectedDate}
            onChange={onDateChange}
            error={dateError}
            maxDate={maxDate}
            style={{ width: 170 }}
          />
          {canReset && (
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconRotate size={16} />}
              onClick={onReset}
            >
              {t('page.resetBalance')}
            </Button>
          )}
        </Group>
      </Group>

      {hasFilter && (
        <Group gap="xs">
          <Text fz="var(--jurnal-text-sm)" c="dimmed">
            {t('toolbar.showing', { shown: shownCount, total: accountCount })}
          </Text>
        </Group>
      )}
    </Stack>
  );
};

export default BalanceToolbar;
