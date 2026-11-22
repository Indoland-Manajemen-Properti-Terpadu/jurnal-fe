import type { TagListParams } from '@/module/settings/domain/settingTypes';
import type { DepartmentListParams } from '@/module/settings/infrastructure/departmentApi';
import type { PaymentTermListParams } from '@/module/settings/infrastructure/paymentTermApi';

export const settingKeys = {
  all: ['settings'] as const,
  general: () => [...settingKeys.all, 'general'] as const,
  accountMappings: () => [...settingKeys.all, 'account-mappings'] as const,
  numberFormats: () => [...settingKeys.all, 'number-formats'] as const,
  paymentTerms: () => [...settingKeys.all, 'payment-terms'] as const,
  paymentTermList: (params: PaymentTermListParams) =>
    [...settingKeys.paymentTerms(), 'list', params] as const,
  paymentTermDetail: (id: string) => [...settingKeys.paymentTerms(), 'detail', id] as const,
  paymentMethods: () => [...settingKeys.all, 'payment-methods'] as const,
  taxes: () => [...settingKeys.all, 'taxes'] as const,
  departments: () => [...settingKeys.all, 'departments'] as const,
  departmentList: (params: DepartmentListParams) =>
    [...settingKeys.departments(), 'list', params] as const,
  tags: (params?: TagListParams) => [...settingKeys.all, 'tags', params] as const,
};
