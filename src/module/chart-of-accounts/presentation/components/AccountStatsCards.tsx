import React from 'react';
import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconBuildingBank, IconCategory, IconListTree, IconLock } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountStats } from '../../domain/accountStats';

interface AccountStatsCardsProps {
  stats: AccountStats;
}

/** Four overview cards: total accounts, cash and bank, active categories, locked accounts. */
export const AccountStatsCards: React.FC<AccountStatsCardsProps> = ({ stats }) => {
  const { t } = useTranslation('chartOfAccounts');
  const hasLocked = stats.locked > 0;

  const cards = [
    {
      key: 'total',
      title: t('list.stats.totalTitle'),
      hint: t('list.stats.totalHint'),
      value: stats.total,
      valueColor: 'dark.8',
      iconColor: 'primary',
      Icon: IconListTree,
    },
    {
      key: 'cash',
      title: t('list.stats.cashTitle'),
      hint: t('list.stats.cashHint'),
      value: stats.bankCash,
      valueColor: 'teal.8',
      iconColor: 'teal',
      Icon: IconBuildingBank,
    },
    {
      key: 'categories',
      title: t('list.stats.categoriesTitle'),
      hint: t('list.stats.categoriesHint'),
      value: stats.categoriesCount,
      valueColor: 'dark.8',
      iconColor: 'indigo',
      Icon: IconCategory,
    },
    {
      key: 'locked',
      title: t('list.stats.lockedTitle'),
      hint: t('list.stats.lockedHint'),
      value: stats.locked,
      valueColor: hasLocked ? 'orange.8' : 'dark.8',
      iconColor: hasLocked ? 'orange' : 'gray',
      Icon: IconLock,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {cards.map(({ key, title, hint, value, valueColor, iconColor, Icon }) => (
        <Paper
          key={key}
          withBorder
          radius="md"
          p="md"
          bg="white"
          style={{ transition: 'transform 150ms ease, box-shadow 150ms ease' }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                {title}
              </Text>
              <Text fz="var(--jurnal-text-2xl)" fw={800} c={valueColor} mt={4} lh={1.1}>
                {value.toLocaleString('id-ID')}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {hint}
              </Text>
            </div>
            <ThemeIcon size={40} radius="md" variant="light" color={iconColor}>
              <Icon size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
};
