import { JournalAccounts } from '../../JournalAccount/types/JournalAccountModel';

export interface DraftAccount {
  id?: string;
  period?: Date;
  publishedDate?: Date | null;
  accounts?: JournalAccounts | string;
  credit?: number;
  debit?: number;
}
