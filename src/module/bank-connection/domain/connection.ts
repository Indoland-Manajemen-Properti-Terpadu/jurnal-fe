import type { DocumentType } from '@/module/bank-connection/domain/connectionDocuments';
import type { FeeRule, RefreshUsage } from '@/module/bank-connection/domain/feeRules';
import type { AccountType } from '@/module/bank-connection/domain/connectionForm';
import type {
  ConnectionStatus,
  NextAction,
} from '@/module/bank-connection/domain/connectionStatus';

export type ProviderStatus = 'AVAILABLE' | 'COMING_SOON' | 'MAINTENANCE';

/** A bank the user can connect, as `GET /v1/bank-providers` lists it. The screens show only what it returns. */
export interface BankProvider {
  id: string;
  bankName: string;
  /** Official bank code (BI), the same as in the bank master `@/constants/banks`. */
  bankCode?: string;
  accountTypes: AccountType[];
  capabilities: string[];
  status: ProviderStatus;
  /** Monthly fee in rupiah when the provider charges one. */
  monthlyFee?: number;
  requiredFields: string[];
  consentValidityMonths?: number;
  /** The charge rule of each kind of account, when the bank has one. */
  fees?: Partial<Record<AccountType, FeeRule>>;
  /** Logo address the backend sends for the bank; absent means a neutral icon is shown. */
  logoUrl?: string;
}

export interface BankConnection {
  id: string;
  providerId: string;
  bankName: string;
  accountId: string;
  accountType: AccountType;
  status: ConnectionStatus;
  nextAction: NextAction;
  /** Why the request was sent back or refused, in the backend's words. */
  reason?: string;
  /** Always masked: the full number never reaches the screens. */
  accountNumberMasked: string;
  accountHolderName?: string;
  signatoryName?: string;
  memo?: string;
  consentSignedAt?: string;
  consentExpiresAt?: string;
  lastSyncedAt?: string;
  /** Bank balance in rupiah, as the bank reported it; never recomputed here. */
  statementBalance?: number;
  statementBalanceAsOf?: string;
  /** The documents the backend already holds (type and file name only, never the file). */
  documents?: Array<{ type: DocumentType; fileName: string }>;
  /** How many of the month's included refreshes are used (a bank that limits refreshes). */
  refreshUsage?: RefreshUsage;
  /** Set when the backend wants the signature given on another page. */
  signingUrl?: string;
}

export type SyncTrigger = 'SCHEDULE' | 'WEBHOOK' | 'MANUAL';

export interface SyncRun {
  id: string;
  startedAt: string;
  finishedAt?: string;
  trigger: SyncTrigger;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  added: number;
  duplicates: number;
  errorCode?: string;
}

export interface ConnectionEvent {
  id: string;
  at: string;
  actor?: string;
  toStatus: ConnectionStatus;
  reason?: string;
}
