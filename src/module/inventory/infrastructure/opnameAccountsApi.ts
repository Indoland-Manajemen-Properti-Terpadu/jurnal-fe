import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';
import type { OpnameAccountRule, OpnameReason } from '@/module/inventory/domain/stockOpname';
import { toAccountsBody } from '@/module/inventory/infrastructure/opnameApi';

const ACCOUNTS = '/v1/settings/opname-accounts';

interface RuleDto {
  reason: OpnameReason;
  label?: string;
  directions?: ('loss' | 'gain')[];
  accountId?: string | null;
  options?: { id: string; accountNumber: string; name: string }[];
}

export const toAccountRule = (dto: RuleDto): OpnameAccountRule => ({
  reason: dto.reason,
  label: dto.label ?? dto.reason,
  directions: dto.directions ?? [],
  accountId: dto.accountId ?? null,
  options: dto.options ?? [],
});

export const fetchOpnameAccounts = async (): Promise<OpnameAccountRule[]> => {
  try {
    const { data } = await apiClient.get<{ data?: RuleDto[] }>(ACCOUNTS);
    return (data.data ?? []).map(toAccountRule);
  } catch (error) {
    throw toApiError(error);
  }
};

export const saveOpnameAccounts = async (accounts: Record<string, string>): Promise<void> => {
  try {
    await apiClient.put(ACCOUNTS, toAccountsBody(accounts));
  } catch (error) {
    throw toApiError(error);
  }
};
