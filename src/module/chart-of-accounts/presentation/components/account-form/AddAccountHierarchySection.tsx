import React from 'react';
import {
  Alert,
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

interface AddAccountHierarchySectionProps {
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
}

/** Section 2: account structure and hierarchy. */
export const AddAccountHierarchySection: React.FC<AddAccountHierarchySectionProps> = ({
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
}) => {
  const { t } = useTranslation('journal');

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="teal">
            <IconHierarchy2 size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={15} c="dark.8">
              {t('sec2Title')}
            </Text>
            <Text fz={12} c="dimmed">
              {t('sec2Subtitle')}
            </Text>
          </div>
        </Group>
        <Badge variant="light" color="teal" size="sm">
          Langkah 2 dari 3
        </Badge>
      </Group>

      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {[
            {
              value: 'SingleAccount',
              title: t('typeSingleTitle'),
              badge: t('typeSingleBadge'),
              badgeColor: 'gray',
              desc: t('typeSingleDesc'),
            },
            {
              value: 'SubAccount',
              title: t('typeSubTitle'),
              badge: t('typeSubBadge'),
              badgeColor: 'teal',
              desc: t('typeSubDesc'),
            },
            {
              value: 'HeaderAccount',
              title: t('typeHeaderTitle'),
              badge: t('typeHeaderBadge'),
              badgeColor: 'indigo',
              desc: t('typeHeaderDesc'),
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
                <Group justify="space-between" align="flex-start" mb={6}>
                  <Radio
                    value={opt.value}
                    checked={active}
                    onChange={() => setSelectedAccountType(opt.value)}
                    color="primary"
                  />
                  <Badge size="xs" variant="light" color={opt.badgeColor}>
                    {opt.badge}
                  </Badge>
                </Group>
                <Text fw={700} fz={13} c="dark.8">
                  {opt.title}
                </Text>
                <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                  {opt.desc}
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>

        {/* Conditional Hierarchy Selector + Visual Tree Diagram */}
        {selectedAccountType !== 'SingleAccount' && !form.values.category && (
          <Alert icon={<IconInfoCircle size={16} />} color="yellow" radius="md">
            {t('selectCategoryFirstAlert')}
          </Alert>
        )}

        {selectedAccountType === 'SubAccount' && form.values.category && (
          <Stack gap="xs">
            <Select
              label={t('selectParentLabel')}
              description={t('selectParentHelper')}
              placeholder={t('selectParentPlaceholder')}
              data={headAccountOptions}
              value={headAccountId}
              onChange={setHeadAccountId}
              withAsterisk
              searchable
              clearable
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              nothingFoundMessage="Tidak ditemukan akun induk pada kategori ini"
            />

            {/* Visual Tree Representation */}
            <Paper withBorder radius="md" p="sm" bg="gray.0">
              <Text fz={11} fw={700} c="dimmed" mb={6}>
                {t('hierarchyVisualLabel')}
              </Text>
              <Stack gap={4}>
                <Group gap={6}>
                  <Badge size="xs" color="indigo" variant="light">
                    INDUK
                  </Badge>
                  <Text fz={12} fw={600} c="dark.7">
                    {parentAccountLabel || '[Pilih Akun Induk di atas]'}
                  </Text>
                </Group>
                <Group gap={6} pl={18}>
                  <IconCornerDownRight size={14} color={themeColors.primary[6]} />
                  <Badge size="xs" color="teal" variant="filled">
                    SUB AKUN BARU
                  </Badge>
                  <Text fz={12} fw={700} c="primary.8" ff="monospace">
                    [{form.values.accountNumber || '—'}]
                  </Text>
                  <Text fz={12} fw={700} c="dark.9">
                    {form.values.name || t('previewUnnamed')}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        )}

        {selectedAccountType === 'HeaderAccount' && form.values.category && (
          <Stack gap="xs">
            <Select
              label={t('selectChildLabel')}
              description={t('selectChildHelper')}
              placeholder={t('selectChildPlaceholder')}
              data={subAccountOptions}
              value={subAccountId}
              onChange={setSubAccountId}
              searchable
              clearable
              rightSection={<IconChevronDown size={16} />}
              styles={SYMMETRIC_INPUT_STYLES}
              nothingFoundMessage="Tidak ditemukan sub akun pada kategori ini"
            />

            {/* Visual Tree Representation */}
            <Paper withBorder radius="md" p="sm" bg="gray.0">
              <Text fz={11} fw={700} c="dimmed" mb={6}>
                {t('hierarchyVisualLabel')}
              </Text>
              <Stack gap={4}>
                <Group gap={6}>
                  <Badge size="xs" color="indigo" variant="filled">
                    AKUN INDUK BARU
                  </Badge>
                  <Text fz={12} fw={700} c="primary.8" ff="monospace">
                    [{form.values.accountNumber || '—'}]
                  </Text>
                  <Text fz={12} fw={700} c="dark.9">
                    {form.values.name || t('previewUnnamed')}
                  </Text>
                </Group>
                <Group gap={6} pl={18}>
                  <IconCornerDownRight size={14} color={themeColors.slate[5]} />
                  <Badge size="xs" color="teal" variant="light">
                    SUB AKUN
                  </Badge>
                  <Text fz={12} fw={600} c="dark.7">
                    {childAccountLabel || '(Sub-akun dapat ditambahkan nanti)'}
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
