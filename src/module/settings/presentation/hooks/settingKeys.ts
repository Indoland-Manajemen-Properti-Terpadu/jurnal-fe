import type { TagListParams } from '@/module/settings/domain/settingTypes';

export const settingKeys = {
  all: ['settings'] as const,
  general: () => [...settingKeys.all, 'general'] as const,
  accountMappings: () => [...settingKeys.all, 'account-mappings'] as const,
  numberFormats: () => [...settingKeys.all, 'number-formats'] as const,
  paymentTerms: () => [...settingKeys.all, 'payment-terms'] as const,
  paymentMethods: () => [...settingKeys.all, 'payment-methods'] as const,
  taxes: () => [...settingKeys.all, 'taxes'] as const,
  tags: (params?: TagListParams) => [...settingKeys.all, 'tags', params] as const,
};
