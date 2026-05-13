import { JournalAccounts } from '../../AkunJurnal/types/JournalAccountModel';

export interface DraftAccount {
  id?: string;
  period?: Date;
  publishedDate?: Date | null;
  accounts?: JournalAccounts | string;
  credit?: number;
  debit?: number;
}
