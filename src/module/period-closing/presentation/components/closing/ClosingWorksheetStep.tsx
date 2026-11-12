import { useState } from 'react';
import { Alert, Button, Group, Skeleton, Stack, Switch, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowUpRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { TrialBalanceAccount } from '@/module/reports';
import type { CloseBooksWizard } from '@/module/period-closing/presentation/hooks/useCloseBooksWizard';
import { formatAmount, formatDay } from '@/module/period-closing/presentation/periodFormat';
import { StepCard } from './StepCard';
import classes from './ClosingWorksheet.module.css';

type Cells = { debit: number | null; credit: number | null } | null;

const GROUPS = ['closing', 'profitLoss', 'balanceSheet'] as const;
const GROUP_LABEL = {
  closing: 'wizard.worksheet.trialBalance',
  profitLoss: 'wizard.worksheet.profitLoss',
  balanceSheet: 'wizard.worksheet.balanceSheet',
} as const;

const hasBalance = (account: TrialBalanceAccount) =>
  Boolean(account.closing?.debit || account.closing?.credit);

function FigureCells({ cells }: Readonly<{ cells: Cells }>) {
  return (
    <>
      <Table.Td className={`${classes.figure} ${classes.groupStart}`}>
        {formatAmount(cells?.debit)}
      </Table.Td>
      <Table.Td className={classes.figure}>{formatAmount(cells?.credit)}</Table.Td>
    </>
  );
}

/** Step 3: the trial balance split into what is closed (profit and loss) and what carries on. */
export function ClosingWorksheetStep({ wizard }: Readonly<{ wizard: CloseBooksWizard }>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const [onlyBalances, setOnlyBalances] = useState(true);
  const { trialBalance, range } = wizard;
  const report = trialBalance.data;

  const accounts = (report?.accounts ?? []).filter(
    (account) => !account.isHead && (!onlyBalances || hasBalance(account))
  );
  const profit = report?.profit ?? 0;

  const body = () => {
    if (trialBalance.isLoading) {
      return (
        <Stack gap="xs">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={20} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (trialBalance.isError || !report) {
      return (
        <Alert variant="light" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
          {t('wizard.worksheet.error')}
          <Button
            mt="sm"
            size="xs"
            variant="default"
            display="block"
            onClick={() => trialBalance.refetch()}
          >
            {t('wizard.worksheet.retry')}
          </Button>
        </Alert>
      );
    }
    return (
      <div className={classes.frame}>
        <Table className={classes.table} verticalSpacing={6} horizontalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th rowSpan={2} className={classes.sticky}>
                {t('wizard.worksheet.account')}
              </Table.Th>
              {GROUPS.map((group) => (
                <Table.Th
                  key={group}
                  colSpan={2}
                  className={`${classes.groupTitle} ${classes.groupStart}`}
                >
                  {t(GROUP_LABEL[group])}
                </Table.Th>
              ))}
            </Table.Tr>
            <Table.Tr>
              {GROUPS.map((group) => (
                <ColumnPair key={group} />
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {accounts.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    {t('wizard.worksheet.empty')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              accounts.map((account) => (
                <Table.Tr key={account.id}>
                  <Table.Td className={classes.sticky}>
                    <Text size="sm" span c="dimmed" mr={6}>
                      {account.accountNumber}
                    </Text>
                    <Text size="sm" span>
                      {account.name}
                    </Text>
                  </Table.Td>
                  {GROUPS.map((group) => (
                    <FigureCells key={group} cells={account[group]} />
                  ))}
                </Table.Tr>
              ))
            )}
            <Table.Tr className={classes.totalRow}>
              <Table.Td className={classes.sticky}>{t('wizard.worksheet.total')}</Table.Td>
              {GROUPS.map((group) => (
                <FigureCells key={group} cells={report.totals[group]} />
              ))}
            </Table.Tr>
            <Table.Tr className={classes.profitRow}>
              <Table.Td className={classes.sticky}>
                {profit >= 0 ? t('wizard.worksheet.netProfit') : t('wizard.worksheet.netLoss')}
              </Table.Td>
              <FigureCells cells={null} />
              <FigureCells cells={report.balancing.profitLoss} />
              <FigureCells cells={report.balancing.balanceSheet} />
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </div>
    );
  };

  return (
    <StepCard
      step={3}
      title={t('wizard.worksheet.title')}
      description={t('wizard.worksheet.subtitle', {
        start: formatDay(range.startDate, currentLanguage),
        end: formatDay(range.endDate, currentLanguage),
      })}
      actions={
        <Group gap="md">
          <Switch
            size="sm"
            label={t('wizard.worksheet.onlyBalances')}
            checked={onlyBalances}
            onChange={(event) => setOnlyBalances(event.currentTarget.checked)}
          />
          <Button
            component={Link}
            to={routes.reports.trialBalance}
            target="_blank"
            size="xs"
            variant="subtle"
            rightSection={<IconArrowUpRight size={14} />}
          >
            {t('wizard.worksheet.openReport')}
          </Button>
        </Group>
      }
    >
      {body()}
    </StepCard>
  );
}

function ColumnPair() {
  const { t } = useTranslation('periodClosing');
  return (
    <>
      <Table.Th className={`${classes.figureHead} ${classes.groupStart}`}>
        {t('wizard.worksheet.debit')}
      </Table.Th>
      <Table.Th className={classes.figureHead}>{t('wizard.worksheet.credit')}</Table.Th>
    </>
  );
}
