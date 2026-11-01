import React from 'react';
import {
  Accordion,
  Badge,
  Box,
  Divider,
  Group,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconBulb, IconHierarchy2, IconListNumbers, IconScale } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface AccountingGuideCardProps {
  activePrefix?: string;
}

type RuleGroup = 'neraca' | 'labarugi';

const NUMBERING_RULES: {
  prefix: string;
  nameKey: string;
  debit: boolean;
  group: RuleGroup;
}[] = [
  { prefix: '1', nameKey: 'asset', debit: true, group: 'neraca' },
  { prefix: '2', nameKey: 'liability', debit: false, group: 'neraca' },
  { prefix: '3', nameKey: 'equity', debit: false, group: 'neraca' },
  { prefix: '4', nameKey: 'revenue', debit: false, group: 'labarugi' },
  { prefix: '5', nameKey: 'cogs', debit: true, group: 'labarugi' },
  { prefix: '6', nameKey: 'opex', debit: true, group: 'labarugi' },
  { prefix: '7', nameKey: 'otherIncome', debit: false, group: 'labarugi' },
  { prefix: '8', nameKey: 'otherExpense', debit: true, group: 'labarugi' },
];

export const AccountingGuideCard: React.FC<AccountingGuideCardProps> = ({ activePrefix }) => {
  const { t } = useTranslation('chartOfAccounts');
  const rules = NUMBERING_RULES.map((rule) => ({
    ...rule,
    code: `${rule.prefix}-XXXX`,
    name: t(`guide.rules.${rule.nameKey}`),
    side: rule.debit ? t('guide.sideDebit') : t('guide.sideCredit'),
    color: rule.debit ? 'teal' : 'red',
  }));

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size={28} radius="md" variant="light" color="yellow">
            <IconBulb size={16} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
              {t('guide.title')}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('guide.subtitle')}
            </Text>
          </div>
        </Group>
        <Badge size="xs" variant="light" color="primary">
          1-XXXX – 8-XXXX
        </Badge>
      </Group>

      <Accordion variant="separated" radius="md" defaultValue="numbering">
        <Accordion.Item value="numbering">
          <Accordion.Control icon={<IconListNumbers size={16} color={themeColors.primary[6]} />}>
            <Text fz="var(--jurnal-text-xs)" fw={700}>
              {t('guide.numberingTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={6}>
              <Text fz="var(--jurnal-text-xs)" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                {t('guide.balanceGroup')}
              </Text>
              {rules
                .filter((r) => r.group === 'neraca')
                .map((item) => {
                  const isActive = activePrefix === item.prefix;
                  return (
                    <Box
                      key={item.code}
                      px={8}
                      py={5}
                      style={{
                        borderRadius: 6,
                        backgroundColor: isActive
                          ? 'var(--mantine-color-primary-0)'
                          : 'transparent',
                        border: isActive
                          ? `1px solid ${themeColors.primary[4]}`
                          : '1px solid transparent',
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text fz="var(--jurnal-text-xs)" c="dimmed" truncate>
                          <Text span fw={700} ff="monospace" c={isActive ? 'primary.8' : 'dark.8'}>
                            {item.code}
                          </Text>{' '}
                          : {item.name}
                        </Text>
                        <Badge size="xs" variant={isActive ? 'filled' : 'light'} color={item.color}>
                          {item.side}
                        </Badge>
                      </Group>
                    </Box>
                  );
                })}

              <Divider my={2} />

              <Text fz="var(--jurnal-text-xs)" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                {t('guide.profitLossGroup')}
              </Text>
              {rules
                .filter((r) => r.group === 'labarugi')
                .map((item) => {
                  const isActive = activePrefix === item.prefix;
                  return (
                    <Box
                      key={item.code}
                      px={8}
                      py={5}
                      style={{
                        borderRadius: 6,
                        backgroundColor: isActive
                          ? 'var(--mantine-color-primary-0)'
                          : 'transparent',
                        border: isActive
                          ? `1px solid ${themeColors.primary[4]}`
                          : '1px solid transparent',
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text fz="var(--jurnal-text-xs)" c="dimmed" truncate>
                          <Text span fw={700} ff="monospace" c={isActive ? 'primary.8' : 'dark.8'}>
                            {item.code}
                          </Text>{' '}
                          : {item.name}
                        </Text>
                        <Badge size="xs" variant={isActive ? 'filled' : 'light'} color={item.color}>
                          {item.side}
                        </Badge>
                      </Group>
                    </Box>
                  );
                })}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="contra">
          <Accordion.Control icon={<IconScale size={16} color={themeColors.secondary[6]} />}>
            <Text fz="var(--jurnal-text-xs)" fw={700}>
              {t('guide.contraTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text fz="var(--jurnal-text-xs)" c="dimmed" lh={1.45}>
              {t('guide.contraPrefix')}{' '}
              <Text span fw={600} c="dark.8">
                {t('guide.contraTerm')}
              </Text>{' '}
              {t('guide.contraSuffix')}
            </Text>
            <List size="xs" spacing={4} mt={6} c="dimmed">
              <List.Item>
                <Text span fz="var(--jurnal-text-xs)">
                  {t('guide.contraEx1')}
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz="var(--jurnal-text-xs)">
                  {t('guide.contraEx2')}
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz="var(--jurnal-text-xs)">
                  {t('guide.contraEx3')}
                </Text>
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="hierarchy">
          <Accordion.Control icon={<IconHierarchy2 size={16} color={themeColors.primary[5]} />}>
            <Text fz="var(--jurnal-text-xs)" fw={700}>
              {t('guide.hierarchyTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text fz="var(--jurnal-text-xs)" c="dimmed" lh={1.45}>
              <Text span fw={600} c="dark.8">
                {t('guide.subTerm')}
              </Text>{' '}
              {t('guide.subText')}{' '}
              <Text span fw={600} c="dark.8">
                {t('guide.headerTerm')}
              </Text>{' '}
              {t('guide.headerText')}
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};
