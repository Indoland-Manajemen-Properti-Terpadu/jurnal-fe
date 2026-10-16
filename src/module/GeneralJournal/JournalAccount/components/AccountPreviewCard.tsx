import React from 'react';
import {
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCornerDownRight,
  IconEye,
  IconHierarchy2,
  IconKey,
  IconReceiptTax,
  IconScale,
} from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface AccountPreviewCardProps {
  accountNumber: string;
  accountName: string;
  categoryName: string;
  isDebit?: boolean;
  isContra: boolean;
  isBankAndCash?: boolean;
  accountType: 'SingleAccount' | 'SubAccount' | 'HeaderAccount' | string;
  parentAccountLabel?: string;
  childAccountLabel?: string;
  taxType?: string;
  desc?: string;
  accessType: string;
  specialUsersCount: number;
  certainRolesCount: number;
}

export const AccountPreviewCard: React.FC<AccountPreviewCardProps> = ({
  accountNumber,
  accountName,
  categoryName,
  isDebit = true,
  isContra,
  isBankAndCash = false,
  accountType,
  parentAccountLabel,
  childAccountLabel,
  taxType,
  desc,
  accessType,
  specialUsersCount,
  certainRolesCount,
}) => {
  const { t } = useTranslation('journal');

  // Determine effective balance position (accounting logic)
  const effectiveDebit = isContra ? !isDebit : isDebit;
  const normalBalanceLabel = effectiveDebit ? 'Debit' : 'Kredit';
  const normalBalanceColor = effectiveDebit ? 'blue' : 'violet';

  let accountTypeLabel = t('typeSingleTitle');
  let accountTypeColor = 'gray';
  if (accountType === 'SubAccount') {
    accountTypeLabel = t('typeSubTitle');
    accountTypeColor = 'teal';
  } else if (accountType === 'HeaderAccount') {
    accountTypeLabel = t('typeHeaderTitle');
    accountTypeColor = 'indigo';
  }

  let accessLabel = t('accessAllTitle');
  if (accountType === 'SingleAccount') {
    if (accessType === 'SpecialUsers') {
      accessLabel = `${specialUsersCount} ${t('accessUsersTitle')}`;
    } else if (accessType === 'CertainRoles') {
      accessLabel = `${certainRolesCount} ${t('accessRolesTitle')}`;
    }
  }

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size={30} radius="md" variant="light" color="primary">
            <IconEye size={17} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={13} c="dark.8">
              {t('previewTitle')}
            </Text>
            <Text fz={11} c="dimmed">
              {t('previewSubtitle')}
            </Text>
          </div>
        </Group>
        <Badge variant="dot" color="teal" size="xs">
          {t('previewInteractiveBadge')}
        </Badge>
      </Group>

      <Divider my="xs" />

      {/* Account Card Simulation */}
      <Paper
        withBorder
        radius="md"
        p="sm"
        bg="var(--mantine-color-gray-0)"
        style={{
          borderLeft: `4px solid ${
            effectiveDebit ? themeColors.primary[6] : themeColors.secondary[6]
          }`,
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap={6}>
            <Group gap={6} wrap="wrap">
              <Badge
                variant="filled"
                color="primary.9"
                radius="sm"
                ff="monospace"
                fz={12}
                fw={700}
                px={8}
                py={4}
              >
                {accountNumber || '— — — —'}
              </Badge>
              <Badge variant="light" color={accountTypeColor} size="sm">
                {accountTypeLabel}
              </Badge>
              {isBankAndCash && (
                <Badge
                  variant="light"
                  color="cyan"
                  size="sm"
                  leftSection={<IconBuildingBank size={11} />}
                >
                  Kas & Bank
                </Badge>
              )}
              {isContra && (
                <Badge variant="outline" color="orange" size="sm">
                  Kontra
                </Badge>
              )}
            </Group>

            <Tooltip label={`${t('stripNormalBalanceLabel')}: ${normalBalanceLabel}`}>
              <Badge
                variant="light"
                color={normalBalanceColor}
                size="sm"
                leftSection={<IconScale size={12} />}
              >
                {normalBalanceLabel}
              </Badge>
            </Tooltip>
          </Group>

          <Box>
            <Text fw={800} fz={15} c="dark.9" lh={1.3}>
              {accountName || t('previewUnnamed')}
            </Text>
            <Text fz={12} c="dimmed" mt={2}>
              {t('accountCategory')}:{' '}
              <Text span fw={600} c="dark.7">
                {categoryName || t('previewUncategorized')}
              </Text>
            </Text>
          </Box>

          {accountType === 'SubAccount' && parentAccountLabel && (
            <Group gap={6} align="center" wrap="nowrap">
              <IconCornerDownRight size={14} color={themeColors.slate[5]} />
              <Text fz={11.5} c="dimmed" truncate>
                {t('parentAccount')}:{' '}
                <Text span fw={600} c="dark.8">
                  {parentAccountLabel}
                </Text>
              </Text>
            </Group>
          )}

          {accountType === 'HeaderAccount' && childAccountLabel && (
            <Group gap={6} align="center" wrap="nowrap">
              <IconHierarchy2 size={14} color={themeColors.slate[5]} />
              <Text fz={11.5} c="dimmed" truncate>
                {t('subAccount')}:{' '}
                <Text span fw={600} c="dark.8">
                  {childAccountLabel}
                </Text>
              </Text>
            </Group>
          )}

          {desc && (
            <Text fz={11} c="dimmed" lineClamp={2} fs="italic">
              &ldquo;{desc}&rdquo;
            </Text>
          )}

          <Divider my={2} style={{ opacity: 0.6 }} />

          <Group justify="space-between" fz={11} c="dimmed">
            <Group gap={4}>
              <IconKey size={13} />
              <Text fz={11} c="dimmed">
                Akses:{' '}
                <Text span fw={600} c="dark.7">
                  {accessLabel}
                </Text>
              </Text>
            </Group>
            {taxType && (
              <Group gap={4}>
                <IconReceiptTax size={13} />
                <Badge size="xs" variant="outline" color="blue">
                  {taxType}
                </Badge>
              </Group>
            )}
          </Group>
        </Stack>
      </Paper>

      {/* Instant Cause-and-Effect Balance Behavior Simulation */}
      <Box mt="sm">
        <Text fz={11} fw={700} c="dimmed" tt="uppercase" lts={0.4} mb={6}>
          {t('behaviorSimulationTitle')}
        </Text>
        <SimpleGrid cols={2} spacing="xs">
          <Paper
            withBorder
            radius="sm"
            p={8}
            bg={effectiveDebit ? 'teal.0' : 'orange.0'}
            style={{
              borderColor: effectiveDebit
                ? 'var(--mantine-color-teal-3)'
                : 'var(--mantine-color-orange-3)',
            }}
          >
            <Group gap={4} wrap="nowrap">
              {effectiveDebit ? (
                <IconArrowUpRight size={14} color="var(--mantine-color-teal-7)" />
              ) : (
                <IconArrowDownRight size={14} color="var(--mantine-color-orange-7)" />
              )}
              <Text fz={10.5} fw={700} c="dark.7">
                {t('whenDebited')}
              </Text>
            </Group>
            <Text fz={11} fw={700} c={effectiveDebit ? 'teal.8' : 'orange.8'} mt={2}>
              {effectiveDebit ? t('balanceIncreases') : t('balanceDecreases')}
            </Text>
          </Paper>

          <Paper
            withBorder
            radius="sm"
            p={8}
            bg={!effectiveDebit ? 'teal.0' : 'orange.0'}
            style={{
              borderColor: !effectiveDebit
                ? 'var(--mantine-color-teal-3)'
                : 'var(--mantine-color-orange-3)',
            }}
          >
            <Group gap={4} wrap="nowrap">
              {!effectiveDebit ? (
                <IconArrowUpRight size={14} color="var(--mantine-color-teal-7)" />
              ) : (
                <IconArrowDownRight size={14} color="var(--mantine-color-orange-7)" />
              )}
              <Text fz={10.5} fw={700} c="dark.7">
                {t('whenCredited')}
              </Text>
            </Group>
            <Text fz={11} fw={700} c={!effectiveDebit ? 'teal.8' : 'orange.8'} mt={2}>
              {!effectiveDebit ? t('balanceIncreases') : t('balanceDecreases')}
            </Text>
          </Paper>
        </SimpleGrid>
      </Box>
    </Paper>
  );
};
