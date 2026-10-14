import type { GeneralLedgerAccount, GeneralLedgerReport, GeneralLedgerTransaction } from '../../domain/entities/generalLedger';

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Format ${label} dari server tidak valid.`);
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, label: string): string {
  if (typeof value !== 'string') throw new Error(`Format ${label} dari server tidak valid.`);
  return value;
}

function amount(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Nilai ${label} dari server tidak valid.`);
  }
  return value;
}

function transaction(value: unknown): GeneralLedgerTransaction {
  const source = object(value, 'transaksi');
  const reference = source.transactionNumber;
  if (typeof reference !== 'number' && typeof reference !== 'string') {
    throw new Error('Nomor transaksi dari server tidak valid.');
  }
  return {
    transactionDate: string(source.transactionDate, 'tanggal transaksi'),
    transactionNumber: String(reference),
    description: string(source.description, 'deskripsi transaksi'),
    debit: amount(source.debit, 'debit transaksi'),
    credit: amount(source.credit, 'kredit transaksi'),
    balance: amount(source.balance, 'saldo transaksi'),
    journalId: string(source.journalId, 'ID jurnal'),
  };
}

function account(value: unknown): GeneralLedgerAccount {
  const source = object(value, 'akun');
  const details = object(source.account, 'detail akun');
  const { category } = details;
  const categoryName = typeof category === 'string'
    ? category
    : string(object(category, 'kategori akun').name, 'nama kategori akun');
  if (!Array.isArray(source.transactions)) throw new Error('Daftar transaksi dari server tidak valid.');
  return {
    id: string(details.id, 'ID akun'),
    number: string(details.accountNumber, 'nomor akun'),
    name: string(details.name, 'nama akun'),
    category: categoryName,
    isContra: details.isContra === true,
    openingBalance: amount(source.openingBalance, 'saldo awal'),
    transactions: source.transactions.map(transaction),
    periodDebit: amount(source.periodDebit, 'total debit akun'),
    periodCredit: amount(source.periodCredit, 'total kredit akun'),
    closingBalance: amount(source.closingBalance, 'saldo akhir'),
  };
}

export function mapGeneralLedgerResponse(value: unknown): GeneralLedgerReport {
  const envelope = object(value, 'respons buku besar');
  const data = object(envelope.data, 'data buku besar');
  if (!Array.isArray(data.accounts)) throw new Error('Daftar akun dari server tidak valid.');
  const lock = data.periodLockInfo == null ? null : object(data.periodLockInfo, 'status periode');
  return {
    accounts: data.accounts.map(account),
    periodDebitTotal: amount(data.periodDebitTotal, 'total debit periode'),
    periodCreditTotal: amount(data.periodCreditTotal, 'total kredit periode'),
    periodLockName: lock ? string(lock.name, 'nama periode') : null,
    periodLockType: lock ? string(lock.type, 'tipe periode') : null,
  };
}
