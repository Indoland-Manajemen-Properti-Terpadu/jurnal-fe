import type { ReactNode } from 'react';
import { Badge, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import type { DetailAccountModel } from '@/module/chart-of-accounts';
import type { NormalSide } from '../../domain/normalBalance';

const Row: React.FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <Group justify="space-between">
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    {children}
  </Group>
);

interface AccountInfoPanelProps {
  account: DetailAccountModel;
  normalBalance: NormalSide;
}

/** "Account information" tab: profile of the account and how its sides move the balance. */
export const AccountInfoPanel: React.FC<AccountInfoPanelProps> = ({ account, normalBalance }) => {
  const { t } = useTranslation('accountLedger');
  const isDebit = normalBalance === 'Debit';
  const side = t(`common.side.${normalBalance}`);
  const effect = (increases: boolean) =>
    t(increases ? 'nonCashBank.info.increases' : 'nonCashBank.info.decreases');
  const effectColor = (increases: boolean) => (increases ? 'teal.7' : 'red.6');

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Paper withBorder radius="md" p="lg" bg="gray.0">
        <Title order={5} fw={700} c="dark.8" mb="md">
          {t('nonCashBank.info.profileTitle')}
        </Title>
        <Stack gap="sm">
          <Row label={t('nonCashBank.info.code')}>
            <Badge variant="outline" color="primary" ff="monospace" size="md">
              {account.accountNumber}
            </Badge>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.name')}>
            <Text size="sm" fw={600} c="dark.8">
              {account.name}
            </Text>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.category')}>
            <Badge variant="light" color="indigo">
              {account.category?.name || t('nonCashBank.categoryFallback')}
            </Badge>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.level')}>
            <Text size="sm" fw={600} c="dark.8">
              {t('nonCashBank.info.levelValue', {
                level: account.level || '0',
                kind: t(
                  Number(account.level) > 1
                    ? 'nonCashBank.info.subAccount'
                    : 'nonCashBank.info.mainAccount'
                ),
              })}
            </Text>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.locking')}>
            {account.isLocked ? (
              <Badge color="blue" variant="filled">
                {t('nonCashBank.info.lockedSystem')}
              </Badge>
            ) : (
              <Badge color="teal" variant="light">
                {t('nonCashBank.info.adjustable')}
              </Badge>
            )}
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.access')}>
            <Text size="sm" fw={500} c="dark.7">
              {t(account.isAllUser ? 'nonCashBank.info.allUsers' : 'nonCashBank.info.restricted')}
            </Text>
          </Row>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="lg" bg="gray.0">
        <Title order={5} fw={700} c="dark.8" mb="md">
          {t('nonCashBank.info.guideTitle')}
        </Title>
        <Stack gap="sm">
          <Row label={t('nonCashBank.info.normal')}>
            <Badge color={isDebit ? 'teal' : 'red'} variant="filled" size="md">
              {side}
            </Badge>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.debitEffect')}>
            <Text size="sm" fw={600} c={effectColor(isDebit)}>
              {effect(isDebit)}
            </Text>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.creditEffect')}>
            <Text size="sm" fw={600} c={effectColor(!isDebit)}>
              {effect(!isDebit)}
            </Text>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.balance')}>
            <Text size="sm" fw={700} ff="monospace" c="dark.8">
              {formatCurrency(account.amount || 0)}
            </Text>
          </Row>
          <Divider />
          <Row label={t('nonCashBank.info.draftBalance')}>
            <Text size="sm" ff="monospace" c="dimmed">
              {formatCurrency(account.draftAmount || 0)}
            </Text>
          </Row>
        </Stack>
      </Paper>
    </SimpleGrid>
  );
};
