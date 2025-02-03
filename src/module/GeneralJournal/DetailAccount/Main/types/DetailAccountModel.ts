export interface DetailAccountModel {
  id?: string;
  isLocked?: boolean;
  name?: string;
  type?: string;
  accountNumber?: string;
  category?: Category;
  subAccount?: any[];
  amount?: number;
  draftAmount?: number;
  isPublished?: boolean;
  isAllUser?: boolean;
  level?: string;
  reconciliationDetail?: any[];
  journals?: any[];
  site?: Site;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id?: string;
  categoryID?: string;
  name?: string;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Site {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const accountDetailData = (data?: Partial<DetailAccountModel>): DetailAccountModel => {
  return {
    id: data?.id || '',
    isLocked: data?.isLocked || false,
    name: data?.name || 'N/A',
    type: data?.type || 'N/A',
    accountNumber: data?.accountNumber || 'N/A',
    category: data?.category || { id: '', name: 'N/A' },
    subAccount: data?.subAccount || [],
    amount: data?.amount || 0,
    draftAmount: data?.draftAmount || 0,
    isPublished: data?.isPublished || false,
    isAllUser: data?.isAllUser || false,
    level: data?.level || '0',
    reconciliationDetail: data?.reconciliationDetail || [],
    journals: data?.journals || [],
    site: data?.site || { id: '', name: 'N/A' },
    deleted: data?.deleted || false,
    createdAt: data?.createdAt || new Date(),
    updatedAt: data?.updatedAt || new Date(),
  };
};
