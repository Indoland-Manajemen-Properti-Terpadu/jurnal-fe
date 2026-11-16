import { Anchor, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { unwrapAccountDetail, useDetailAccount } from '@/module/chart-of-accounts';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';

/**
 * Link from a fund to its account in Cash & Bank, with a quiet note when the ledger balance of that
 * account differs from the fund's cash. Both figures are the server's and are never recomputed; when
 * the ledger balance cannot be read the note is left out.
 */
export function FundLedgerLink({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const { accountDetail } = useDetailAccount(fund.account.id);
  const book = unwrapAccountDetail(accountDetail)?.amount;
  const differs = typeof book === 'number' && book !== fund.balance.cashBalance;

  return (
    <Group gap="md" wrap="wrap">
      <Anchor
        component={Link}
        to={routes.accountLedger.cashBank.replace(':idAccount', fund.account.id)}
        size="sm"
      >
        {t('workspace.openLedger')}
      </Anchor>
      {differs && (
        <Text size="xs" c="dimmed">
          {t('workspace.ledgerDiffers', {
            book: formatCurrency(book, false),
            fund: formatCurrency(fund.balance.cashBalance, false),
          })}
        </Text>
      )}
    </Group>
  );
}
