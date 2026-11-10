import React, { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import type { BalanceSheetAccountItem } from '@/module/reports/domain/balanceSheet.types';
import { formatMoney } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import classes from './BalanceSheet.module.css';

export interface BalanceSheetGroup {
  key: string;
  title: string;
  accounts: BalanceSheetAccountItem[];
  /** The server's subtotal of the group (never added up here). */
  subtotal: number;
}

export interface BalanceSheetSection {
  key: string;
  title: string;
  groups: BalanceSheetGroup[];
  /** One group whose name the section head already says: its accounts show without a band. */
  flat?: boolean;
  /** The closing row of the section: its total, as the server reports it. */
  closing: { label: string; value: number };
}

interface BalanceSheetTableProps {
  sections: BalanceSheetSection[];
  /** The last row: the two sides of the equation read against each other. */
  grandTotal?: { label: string; value: number };
  /** True while a search is on: a group with no match is left out instead of shown empty. */
  searching: boolean;
}

/** Negative balances show in parentheses and red, as in a printed statement. */
const signedMoney = (value: number) =>
  value < 0 ? `(${formatMoney(Math.abs(value))})` : formatMoney(value);

/**
 * The whole balance sheet as one table. A section head (assets, liabilities, equity) carries the
 * section's total; under it every group is a band with its name, count and subtotal (so a closed
 * group still reads), followed by its accounts; a closing row ends a side of the equation.
 */
export const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({
  sections,
  grandTotal,
  searching,
}) => {
  const { t } = useTranslation('reports');
  const [closed, setClosed] = useState<string[]>([]);

  const toggle = (key: string) =>
    setClosed((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );

  return (
    <div className={classes.frame}>
      <table className={classes.table}>
        <colgroup>
          <col className={classes.colNumber} />
          <col />
          <col className={classes.colAmount} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{t('common.accountNumberShort')}</th>
            <th scope="col">{t('common.accountName')}</th>
            <th scope="col" data-num="">
              {t('common.balance')}
            </th>
          </tr>
        </thead>

        {sections.map((section) => {
          const groups = searching
            ? section.groups.filter((group) => group.accounts.length > 0)
            : section.groups;
          return (
            <tbody key={section.key}>
              <tr className={classes.sectionHead}>
                <td colSpan={3}>{section.title}</td>
              </tr>

              {groups.length === 0 && (
                <tr>
                  <td colSpan={3} className={classes.muted}>
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
                            <span>{group.title}</span>
                            <span className={classes.count}>{group.accounts.length}</span>
                          </button>
                        </td>
                        <td
                          data-num=""
                          className={`${classes.bandAmount} ${group.subtotal < 0 ? classes.negative : ''}`}
                        >
                          {signedMoney(group.subtotal)}
                        </td>
                      </tr>
                    )}
                    {open &&
                      group.accounts.map((item, index) => (
                        <tr
                          key={
                            item.accountId || item.accountNumber || `${item.accountName}-${index}`
                          }
                        >
                          <td className={classes.number}>{item.accountNumber || '–'}</td>
                          <td>
                            <div>{item.accountName}</div>
                            {item.categoryName && (
                              <div className={classes.category}>{item.categoryName}</div>
                            )}
                          </td>
                          <td
                            data-num=""
                            className={item.balance < 0 ? classes.negative : undefined}
                          >
                            {signedMoney(item.balance)}
                          </td>
                        </tr>
                      ))}
                    {open && !searching && group.accounts.length === 0 && (
                      <tr>
                        <td colSpan={3} className={classes.muted}>
                          {t('balanceSheet.noAccounts')}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              <tr className={classes.closingRow}>
                <td colSpan={2}>{section.closing.label}</td>
                <td data-num="">{formatMoney(section.closing.value)}</td>
              </tr>
            </tbody>
          );
        })}

        {grandTotal && (
          <tfoot>
            <tr className={classes.grandRow}>
              <td colSpan={2}>{grandTotal.label}</td>
              <td data-num="">{formatMoney(grandTotal.value)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
