import type {
  GeneralLedgerAccount,
  GeneralLedgerReport,
  GeneralLedgerTransaction,
} from '@/module/reports/domain/generalLedger.types';
import { safeNumber, safeString } from './reportValue';

function mapTransaction(source: any): GeneralLedgerTransaction {
  if (!source || typeof source !== 'object') {
    return {
      transactionDate: '',
      transactionNumber: '-',
      description: '-',
      debit: 0,
      credit: 0,
      balance: 0,
      journalId: '',
    };
  }

  return {
    transactionDate: safeString(source.transactionDate),
    transactionNumber: safeString(source.transactionNumber, '-'),
    description: safeString(source.description, '-'),
    debit: safeNumber(source.debit),
    credit: safeNumber(source.credit),
    balance: safeNumber(source.balance),
    journalId: safeString(source.journalId),
  };
}

function mapAccount(source: any): GeneralLedgerAccount {
  const accountInfo = source?.account || {};
  const categoryRaw = accountInfo.category;
  const categoryName =
    typeof categoryRaw === 'string' ? categoryRaw : safeString(categoryRaw?.name, 'Lainnya');

  const transactions = Array.isArray(source?.transactions)
    ? source.transactions.map(mapTransaction)
    : [];

  return {
    id: safeString(accountInfo.id || accountInfo._id || source.id),
    number: safeString(accountInfo.accountNumber || source.accountNumber, '-'),
    name: safeString(accountInfo.name || source.name, 'Akun Tanpa Nama'),
    category: categoryName,
    isContra: accountInfo.isContra === true,
    openingBalance: safeNumber(source.openingBalance),
    transactions,
    periodDebit: safeNumber(source.periodDebit),
    periodCredit: safeNumber(source.periodCredit),
    closingBalance: safeNumber(source.closingBalance),
  };
}

export function mapGeneralLedgerResponse(raw: any): GeneralLedgerReport {
  const data = raw?.data || raw || {};
  const accounts = Array.isArray(data.accounts) ? data.accounts.map(mapAccount) : [];

  const lock = data.periodLockInfo || null;

  return {
    accounts,
    periodDebitTotal: safeNumber(data.periodDebitTotal),
    periodCreditTotal: safeNumber(data.periodCreditTotal),
    periodLockName: lock ? safeString(lock.name) : null,
    periodLockType: lock ? safeString(lock.type) : null,
  };
}
