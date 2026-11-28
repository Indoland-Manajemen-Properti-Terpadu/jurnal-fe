import React, { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { BalanceSheetViewSection } from '@/module/reports/domain/balanceSheetView';
import type {
  BalanceSheetAccountItem,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import { displayLongDate, formatAmount } from '@/module/reports/domain/reportFormat';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import {
  useReportNegativeFormat,
  useReportPrecision,
} from '@/module/reports/presentation/hooks/useReportPrecision';
import classes from './BalanceSheet.module.css';

interface BalanceSheetTableProps {
  sections: Array<BalanceSheetViewSection | BalanceSheetSection>;
  searching: boolean;
  compareAsOf?: string;
  period?: BalanceSheetQueryParams;
  grandTotal?:
    | {
        value: number;
        compareValue: number | null;
        change: number | null;
        changePercent: number | null;
      }
    | { label: string; value: number };
  onDerivedAccountClick?: (
    accountName: string,
    accountCode: string | null,
    balance: number,
    accountId: string | null
  ) => void;
}

export interface BalanceSheetGroup {
  key: string;
  title: string;
  accounts: BalanceSheetAccountItem[];
  subtotal: number;
}

export interface BalanceSheetSection {
  key: string;
  title: string;
  groups: BalanceSheetGroup[];
  flat?: boolean;
  closing: { label: string; value: number };
}

const amount = (value: number, precision: number, negativeFormat?: 'minus' | 'parentheses') =>
  value === 0 ? '–' : formatAmount(value, precision, negativeFormat);

const percent = (value: number | null, locale: string) =>
  value === null
    ? '–'
    : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;

export const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({
  sections,
  searching,
  compareAsOf,
  period,
  grandTotal,
  onDerivedAccountClick,
}) => {
  const precision = useReportPrecision();
  const negativeFormat = useReportNegativeFormat();
  const { t, currentLanguage } = useTranslation('reports');
  const [closed, setClosed] = useState<string[]>([]);
  const comparison = Boolean(compareAsOf);
  const actualPeriod = period ?? { startDate: '', endDate: '' };
  const onOpenDerived = onDerivedAccountClick ?? (() => undefined);
  const normalizedSections: BalanceSheetViewSection[] = sections.map((section) => {
    if (!('title' in section)) return section;
    return {
      key: section.key,
      label: section.title,
      total: section.closing.value,
      compareTotal: null,
      changeAmount: null,
      changePercent: null,
      flat: section.flat,
      closingLabel: section.closing.label,
      groups: section.groups.map((group) => ({
        key: group.key,
        label: group.title,
        total: group.subtotal,
        compareTotal: null,
        changeAmount: null,
        changePercent: null,
        rows: group.accounts.map((account, index) => ({
          key: account.accountId ?? account.accountNumber ?? `${account.accountName}-${index}`,
          account,
          code: account.accountNumber,
          name: account.accountName,
          category: account.categoryName,
          balance: account.balance,
          compareBalance: null,
          changeAmount: null,
          changePercent: null,
          accountCount: 1,
        })),
      })),
    };
  });
  const grandTotalValue = grandTotal?.value ?? 0;
  const grandTotalLabel =
    grandTotal && 'label' in grandTotal
      ? grandTotal.label
      : t('balanceSheet.closeLiabilitiesEquity');
  const columnCount = comparison ? 6 : 3;
  const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';

  const toggle = (key: string) =>
    setClosed((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );

  const renderAmount = (value: number, isDelta = false) => (
    <td
      data-num=""
      className={value < 0 ? classes.negative : undefined}
      data-change={isDelta ? '' : undefined}
    >
      {amount(value, precision, negativeFormat)}
    </td>
  );

  const renderChanges = (previous: number | null, delta: number | null, rate: number | null) =>
    comparison ? (
      <>
        {renderAmount(previous ?? 0)}
        {delta === null ? <td data-num="">–</td> : renderAmount(delta, true)}
        <td data-num="">{percent(rate, locale)}</td>
      </>
    ) : null;

  return (
    <div className={classes.frame}>
      <table className={`${classes.table} ${comparison ? classes.comparison : ''}`}>
        <colgroup>
          <col className={classes.colNumber} />
          <col />
          <col className={classes.colAmount} />
          {comparison && (
            <>
              <col className={classes.colAmount} />
              <col className={classes.colAmount} />
              <col className={classes.colPercent} />
            </>
          )}
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{t('balanceSheet.codeColumn')}</th>
            <th scope="col">{t('balanceSheet.accountColumn')}</th>
            <th scope="col" data-num="">
              {/** Date header uses sentence case; other table labels stay uppercase. */}
              <span className={classes.dateHeader}>
                {displayLongDate(actualPeriod.endDate, currentLanguage)}
              </span>
            </th>
            {comparison && (
              <>
                <th scope="col" data-num="">
                  {displayLongDate(compareAsOf, currentLanguage)}
                </th>
                <th scope="col" data-num="">
                  {t('balanceSheet.changeColumn')}
                </th>
                <th scope="col" data-num="">
                  %
                </th>
              </>
            )}
          </tr>
        </thead>

        {normalizedSections.map((section) => {
          const groups = searching
            ? section.groups.filter((group) => group.rows.length > 0)
            : section.groups;
          return (
            <tbody key={section.key}>
              <tr className={classes.sectionHead}>
                <td colSpan={columnCount}>
                  {section.key === 'assets'
                    ? t('balanceSheet.assets')
                    : section.key === 'liabilities'
                      ? t('balanceSheet.liabilities')
                      : section.key === 'equity'
                        ? t('balanceSheet.equity')
                        : section.label}
                </td>
              </tr>
              {groups.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className={classes.muted}>
                    {searching ? t('balanceSheet.noMatch') : t('balanceSheet.noAccounts')}
                  </td>
                </tr>
              )}
              {groups.map((group) => {
                const groupKey = `${section.key}-${group.key}`;
                const open = section.flat || !closed.includes(groupKey);
                return (
                  <React.Fragment key={groupKey}>
                    {!section.flat && (
                      <tr className={classes.band}>
                        <td colSpan={2}>
                          <button
                            type="button"
                            className={classes.bandButton}
                            aria-expanded={open}
                            onClick={() => toggle(groupKey)}
                          >
                            <IconChevronDown
                              size={16}
                              className={classes.chevron}
                              data-open={open}
                            />
                            <span>
                              {section.key === 'assets' && group.key === 'current'
                                ? t('balanceSheet.groupCurrentAssets')
                                : section.key === 'assets' && group.key === 'non-current'
                                  ? t('balanceSheet.groupNonCurrentAssets')
                                  : section.key === 'liabilities' && group.key === 'short'
                                    ? t('balanceSheet.groupCurrentLiabilities')
                                    : section.key === 'liabilities' && group.key === 'long'
                                      ? t('balanceSheet.groupLongTermLiabilities')
                                      : group.label}
                            </span>
                            <span className={classes.count}>
                              {group.rows.reduce((total, row) => total + row.accountCount, 0)}
                            </span>
                          </button>
                        </td>
                        {renderAmount(group.total)}
                        {renderChanges(group.compareTotal, group.changeAmount, group.changePercent)}
                      </tr>
                    )}
                    {open &&
                      group.rows.map((row) => {
                        const { account } = row;
                        const link = account?.accountId
                          ? `${(/kas|bank/i.test(account.categoryName ?? '') ? routes.accountLedger.cashBank : routes.accountLedger.nonCashBank).replace(':idAccount', account.accountId)}?from=${actualPeriod.startDate}&to=${actualPeriod.endDate}`
                          : undefined;
                        const derived = Boolean(
                          account?.derived ||
                          (account?.accountNumber === '3-10002' && account.extra != null)
                        );
                        const category = account?.derived
                          ? t('balanceSheet.profitFromAccounts')
                          : row.category;
                        return (
                          <tr key={row.key}>
                            <td className={classes.number}>{row.code || '–'}</td>
                            <td>
                              <div className={classes.accountCell}>
                                {derived ? (
                                  <button
                                    type="button"
                                    className={classes.accountAction}
                                    onClick={() =>
                                      onOpenDerived(
                                        row.name,
                                        row.code,
                                        row.balance,
                                        account?.accountId ?? null
                                      )
                                    }
                                  >
                                    {row.name}
                                  </button>
                                ) : link ? (
                                  <Link className={classes.accountLink} to={link}>
                                    {row.name}
                                  </Link>
                                ) : (
                                  <span>{row.name}</span>
                                )}
                                {category && <div className={classes.category}>{category}</div>}
                                {!account && (
                                  <div className={classes.category}>
                                    {t('balanceSheet.accountCount', { count: row.accountCount })}
                                  </div>
                                )}
                              </div>
                            </td>
                            {renderAmount(row.balance)}
                            {renderChanges(row.compareBalance, row.changeAmount, row.changePercent)}
                          </tr>
                        );
                      })}
                    {open && !searching && group.rows.length === 0 && (
                      <tr>
                        <td colSpan={columnCount} className={classes.muted}>
                          {t('balanceSheet.noAccounts')}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              <tr className={classes.closingRow}>
                <td colSpan={2}>
                  {section.closingLabel ?? t('balanceSheet.totalFor', { name: section.label })}
                </td>
                {renderAmount(section.total)}
                {renderChanges(section.compareTotal, section.changeAmount, section.changePercent)}
              </tr>
            </tbody>
          );
        })}
        {grandTotal && (
          <tfoot>
            <tr className={classes.grandRow}>
              <td colSpan={2}>{grandTotalLabel}</td>
              {renderAmount(grandTotalValue)}
              {'compareValue' in grandTotal &&
                renderChanges(grandTotal.compareValue, grandTotal.change, grandTotal.changePercent)}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
