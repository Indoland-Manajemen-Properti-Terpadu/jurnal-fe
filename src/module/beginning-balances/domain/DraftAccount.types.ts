import { JournalAccounts } from '@/module/chart-of-accounts';

export interface DraftAccount {
  id?: string;
  period?: Date;
  publishedDate?: Date | null;
  accounts?: JournalAccounts | string;
  credit?: number;
  debit?: number;
}
