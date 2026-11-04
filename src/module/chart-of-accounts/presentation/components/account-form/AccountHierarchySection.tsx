import React from 'react';
import {
  Alert,
  Group,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconChevronDown,
  IconCornerDownRight,
  IconHierarchy2,
  IconInfoCircle,
} from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import type { UseFormReturnType } from '@mantine/form';
import type { AccountFormValues } from '@/module/chart-of-accounts/domain/buildAccountPayload';
import { SYMMETRIC_INPUT_STYLES } from './accountFormStyles';

interface Option {
  value: string;
  label: string;
}

interface AccountHierarchySectionProps {
  form: UseFormReturnType<AccountFormValues>;
  selectedAccountType: string;
  setSelectedAccountType: (value: string) => void;
  headAccountOptions: Option[];
  subAccountOptions: Option[];
  headAccountId: string | null;
  setHeadAccountId: (value: string | null) => void;
  subAccountId: string | null;
  setSubAccountId: (value: string | null) => void;
  parentAccountLabel?: string;
  childAccountLabel?: string;
  /** The edited account is not "new" in the tree preview. */
  isEdit?: boolean;
}

/** Section 2: account structure and hierarchy, shared by the add and edit pages. */
export const AccountHierarchySection: React.FC<AccountHierarchySectionProps> = ({
  form,
  selectedAccountType,
  setSelectedAccountType,
  headAccountOptions,
  subAccountOptions,
  headAccountId,
  setHeadAccountId,
  subAccountId,
  setSubAccountId,
  parentAccountLabel,
  childAccountLabel,
  isEdit = false,
}) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="none">
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <IconHierarchy2 size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
              {t('form.sec2Title')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('form.sec2Subtitle')}
            </Text>
          </div>
        </Group>
      </Group>

      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {[
            {
              value: 'SingleAccount',
              title: t('form.typeSingleTitle'),
              desc: t('form.typeSingleDesc'),
            },
            {
              value: 'SubAccount',
              title: t('form.typeSubTitle'),
              desc: t('form.typeSubDesc'),
            },
            {
              value: 'HeaderAccount',
              title: t('form.typeHeaderTitle'),
              desc: t('form.typeHeaderDesc'),
            },
          ].map((opt) => {
            const active = selectedAccountType === opt.value;
            return (
              <Paper
                key={opt.value}
                withBorder
                radius="md"
                p="sm"
                h="100%"
                onClick={() => setSelectedAccountType(opt.value)}
                style={{
                  cursor: 'pointer',
                  borderColor: active ? themeColors.primary[6] : undefined,
                  backgroundColor: active ? 'var(--mantine-color-primary-0)' : 'white',
                  transition: 'all 0.15s ease',
                }}
              >
                <Group mb={6}>
                  <Radio
                    value={opt.value}
                    checked={active}
                    onChange={() => setSelectedAccountType(opt.value)}
                    color="primary"
                  />
                </Group>
                <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
                  {opt.title}
                </Text>
                <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={3} lh={1.35}>
                  {opt.desc}
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>

        {/* Conditional Hierarchy Selector + Visual Tree Diagram */}
        {selectedAccountType !== 'SingleAccount' && !form.values.category && (
          <Alert icon={<IconInfoCircle size={16} />} color="yellow" radius="md">
            {t('form.selectCategoryFirstAlert')}
          </Alert>
        )}

        {selectedAccountType === 'SubAccount' && form.values.category && (
          <Stack gap="xs">
            <Select
              label={t('form.selectParentLabel')}
              description={t('form.selectParentHelper')}
              placeholder={t('form.selectParentPlaceholder')}
              data={headAccountOptions}
              value={headAccountId}
              onChange={setHeadAccountId}
              withAsterisk
              searchable
              clearable
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              nothingFoundMessage={t('form.nothingFoundParent')}
            />

            {/* Visual Tree Representation */}
            <Paper withBorder radius="md" p="sm" bg="gray.0">
              <Text fz="var(--jurnal-text-xs)" fw={700} c="dimmed" mb={6}>
                {t('form.hierarchyVisualLabel')}
              </Text>
              <Stack gap={4}>
                <Group gap={6}>
                  <Text fz="var(--jurnal-text-xs)" fw={600} c="dimmed" tt="uppercase">
                    {t('form.treeParentBadge')}
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" fw={600} c="dark.7">
                    {parentAccountLabel || t('form.treeParentPending')}
                  </Text>
                </Group>
                <Group gap={6} pl={18}>
                  <IconCornerDownRight size={14} color={themeColors.primary[6]} />
                  <Text fz="var(--jurnal-text-xs)" fw={600} c="dimmed" tt="uppercase">
                    {t(isEdit ? 'form.treeThisAccount' : 'form.treeNewSub')}
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" fw={700} c="primary.8" ff="monospace">
                    [{form.values.accountNumber || '—'}]
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" fw={700} c="dark.9">
                    {form.values.name || t('form.previewUnnamed')}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        )}

        {selectedAccountType === 'HeaderAccount' && form.values.category && (
          <Stack gap="xs">
            <Select
              label={t('form.selectChildLabel')}
              description={t('form.selectChildHelper')}
              placeholder={t('form.selectChildPlaceholder')}
              data={subAccountOptions}
              value={subAccountId}
              onChange={setSubAccountId}
              searchable
              clearable
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              nothingFoundMessage={t('form.nothingFoundChild')}
            />

            {/* Visual Tree Representation */}
            <Paper withBorder radius="md" p="sm" bg="gray.0">
              <Text fz="var(--jurnal-text-xs)" fw={700} c="dimmed" mb={6}>
                {t('form.hierarchyVisualLabel')}
              </Text>
              <Stack gap={4}>
                <Group gap={6}>
                  <Text fz="var(--jurnal-text-xs)" fw={600} c="dimmed" tt="uppercase">
                    {t(isEdit ? 'form.treeThisAccount' : 'form.treeNewHeader')}
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" fw={700} c="primary.8" ff="monospace">
                    [{form.values.accountNumber || '—'}]
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" fw={700} c="dark.9">
                    {form.values.name || t('form.previewUnnamed')}
                  </Text>
                </Group>
                <Group gap={6} pl={18}>
                  <IconCornerDownRight size={14} color={themeColors.slate[5]} />
                  <Text fz="var(--jurnal-text-xs)" fw={600} c="dimmed" tt="uppercase">
                    {t('form.treeSubBadge')}
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" fw={600} c="dark.7">
                    {childAccountLabel || t('form.treeChildPending')}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
