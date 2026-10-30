import React from 'react';
import {
  Badge,
  Group,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconChevronDown, IconHierarchy2 } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface Option {
  value: string;
  label: string;
}

interface EditAccountHierarchySectionProps {
  selectedAccountType: string;
  setSelectedAccountType: (value: string) => void;
  headAccountOptions: Option[];
  subAccountOptions: Option[];
  parentAccountId: string | null;
  setParentAccountId: (value: string | null) => void;
  childAccountId: string | null;
  setChildAccountId: (value: string | null) => void;
}

/** Card 2: account structure and hierarchy (hidden for locked accounts). */
export const EditAccountHierarchySection: React.FC<EditAccountHierarchySectionProps> = ({
  selectedAccountType,
  setSelectedAccountType,
  headAccountOptions,
  subAccountOptions,
  parentAccountId,
  setParentAccountId,
  childAccountId,
  setChildAccountId,
}) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group gap="sm" mb="md">
        <ThemeIcon size={36} radius="md" variant="light" color="teal">
          <IconHierarchy2 size={20} />
        </ThemeIcon>
        <div>
          <Text fw={700} fz={15} c="dark.8">
            {t('edit.hierarchyTitle')}
          </Text>
          <Text fz={12} c="dimmed">
            {t('edit.hierarchySubtitle')}
          </Text>
        </div>
      </Group>

      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {/* Option 1: Akun Mandiri */}
          <Paper
            withBorder
            radius="md"
            p="sm"
            onClick={() => setSelectedAccountType('SingleAccount')}
            style={{
              cursor: 'pointer',
              borderColor:
                selectedAccountType === 'SingleAccount' ? themeColors.primary[6] : undefined,
              backgroundColor:
                selectedAccountType === 'SingleAccount'
                  ? 'var(--mantine-color-primary-0)'
                  : 'white',
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" align="flex-start" mb={4}>
              <Radio
                value="SingleAccount"
                checked={selectedAccountType === 'SingleAccount'}
                onChange={() => setSelectedAccountType('SingleAccount')}
                color="primary"
              />
              <Badge size="xs" variant="light" color="gray">
                {t('edit.singleBadge')}
              </Badge>
            </Group>
            <Text fw={600} fz={13} c="dark.8">
              {t('edit.singleTitle')}
            </Text>
            <Text fz={11} c="dimmed" mt={2}>
              {t('edit.singleDesc')}
            </Text>
          </Paper>

          {/* Option 2: Sub Akun */}
          <Paper
            withBorder
            radius="md"
            p="sm"
            onClick={() => setSelectedAccountType('SubAccount')}
            style={{
              cursor: 'pointer',
              borderColor:
                selectedAccountType === 'SubAccount' ? themeColors.primary[6] : undefined,
              backgroundColor:
                selectedAccountType === 'SubAccount' ? 'var(--mantine-color-primary-0)' : 'white',
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" align="flex-start" mb={4}>
              <Radio
                value="SubAccount"
                checked={selectedAccountType === 'SubAccount'}
                onChange={() => setSelectedAccountType('SubAccount')}
                color="primary"
              />
              <Badge size="xs" variant="light" color="teal">
                {t('edit.subBadge')}
              </Badge>
            </Group>
            <Text fw={600} fz={13} c="dark.8">
              {t('edit.subTitle')}
            </Text>
            <Text fz={11} c="dimmed" mt={2}>
              {t('edit.subDesc')}
            </Text>
          </Paper>

          {/* Option 3: Akun Induk */}
          <Paper
            withBorder
            radius="md"
            p="sm"
            onClick={() => setSelectedAccountType('HeaderAccount')}
            style={{
              cursor: 'pointer',
              borderColor:
                selectedAccountType === 'HeaderAccount' ? themeColors.primary[6] : undefined,
              backgroundColor:
                selectedAccountType === 'HeaderAccount'
                  ? 'var(--mantine-color-primary-0)'
                  : 'white',
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" align="flex-start" mb={4}>
              <Radio
                value="HeaderAccount"
                checked={selectedAccountType === 'HeaderAccount'}
                onChange={() => setSelectedAccountType('HeaderAccount')}
                color="primary"
              />
              <Badge size="xs" variant="light" color="indigo">
                {t('edit.headerBadge')}
              </Badge>
            </Group>
            <Text fw={600} fz={13} c="dark.8">
              {t('edit.headerTitle')}
            </Text>
            <Text fz={11} c="dimmed" mt={2}>
              {t('edit.headerDesc')}
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Conditional Hierarchy Field */}
        {selectedAccountType === 'SubAccount' && (
          <Stack gap="xs" mt="xs">
            <Select
              label={t('edit.parentLabel')}
              placeholder={t('edit.parentPlaceholder')}
              data={headAccountOptions}
              value={parentAccountId}
              onChange={setParentAccountId}
              withAsterisk
              searchable
              clearable
              rightSection={<IconChevronDown size={16} />}
              nothingFoundMessage={t('edit.parentNothing')}
            />
            <Text fz={12} c="dimmed">
              {t('edit.parentHint')}
            </Text>
          </Stack>
        )}

        {selectedAccountType === 'HeaderAccount' && (
          <Stack gap="xs" mt="xs">
            <Select
              label={t('edit.childLabel')}
              placeholder={t('edit.childPlaceholder')}
              data={subAccountOptions}
              value={childAccountId}
              onChange={setChildAccountId}
              searchable
              clearable
              rightSection={<IconChevronDown size={16} />}
              nothingFoundMessage={t('edit.childNothing')}
            />
            <Text fz={12} c="dimmed">
              {t('edit.childHint')}
            </Text>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
