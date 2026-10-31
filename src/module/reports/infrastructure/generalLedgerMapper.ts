import type {
  GeneralLedgerAccount,
  GeneralLedgerReport,
  GeneralLedgerTransaction,
} from '@/module/reports/domain/generalLedger.types';
import { asArray, asRecord, safeNumber, safeString, type RawRecord } from './reportValue';

function mapTransaction(rawSource: unknown): GeneralLedgerTransaction {
  const source: RawRecord = asRecord(rawSource);
  if (!rawSource || typeof rawSource !== 'object') {
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

function mapAccount(rawSource: unknown): GeneralLedgerAccount {
  const source = asRecord(rawSource);
  const accountInfo = asRecord(source.account);
  const categoryRaw = accountInfo.category;
  const categoryName =
    typeof categoryRaw === 'string'
      ? categoryRaw
      : safeString(asRecord(categoryRaw).name, 'Lainnya');

  const transactions = asArray(source.transactions).map(mapTransaction);

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

export function mapGeneralLedgerResponse(raw: unknown): GeneralLedgerReport {
  const data = asRecord(asRecord(raw).data || raw);
  const accounts = asArray(data.accounts).map(mapAccount);

  const lock = data.periodLockInfo ? asRecord(data.periodLockInfo) : null;

  return {
    accounts,
    periodDebitTotal: safeNumber(data.periodDebitTotal),
    periodCreditTotal: safeNumber(data.periodCreditTotal),
    periodLockName: lock ? safeString(lock.name) : null,
    periodLockType: lock ? safeString(lock.type) : null,
  };
}
