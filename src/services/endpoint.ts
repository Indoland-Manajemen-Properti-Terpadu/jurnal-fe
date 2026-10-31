export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jurnal-api.proapps.id';

export const API_AUTH = {
  POST_OAUTH_EXCHANGE: `/v1/auth/oauth/exchange`,
  POST_LOGIN: `/v1/auth/login`,
  POST_REGISTER: `/v1/auth/register`,
  POST_REFRESH_TOKEN: `/v1/auth/refresh-tokens`,
};

export const API_USERS = {
  GET_ALL_USER: `/v1/users`,
  GET_USER_DETAIL: `/v1/users/get-id`,
};

export const API_ACCESS_ROLE = {
  GET_ROLE: `/v1/access-role`,
};

export const API_SITE = {
  GET_ALL_SITE: `/v1/site/get/by-token`,
  POST_SITE: `/v1/site`,
};

export const API_ACCOUNT_BANK = {
  POST_IMPORT_RECONCILLIATION: `/v1/bank-accounts/import/reconciliation`,
};

export const API_ACCOUNT = {
  GET_ALL_ACCOUNT: `/v1/accounts`,
  ADD_ACCOUNT: `/v1/accounts`,
  DELETE_ACCOUNT: `${BASE_URL}/v1/accounts`,
  GET_DETAIL_ACCOUNT: `${BASE_URL}/v1/accounts`,
  POST_TRANSACTION_ACCOUNT: `/v1/journal`,
  GET_TRANSACTION_BY_ACCOUNT: `${BASE_URL}/v1/journal/account`,
  GET_TRANSACTION_DETAIL: `${BASE_URL}/v1/journal/detail`,
  DEL_TRANSACTION_ACCOUNT: `${BASE_URL}/v1/journal`,

  GET_CATEGORY_ACCOUNT: `${BASE_URL}/v1/category-accounts`,
  GET_CATEGORY_INFO: `${BASE_URL}/v1/accounts/category-info`,

  GET_DRAFT_BALANCE: `${BASE_URL}/v1/accounts/get/draft-start-amount`,
  GET_DRAFT_BALANCE_LOGS: `${BASE_URL}/v1/accounts/get/draft-start-amount/logs`,
  POST_DRAFT_BALANCE: `${BASE_URL}/v1/accounts/set/draft-start-amount`,
  POST_PUBLISH_DRAFT_BALANCE: `${BASE_URL}/v1/accounts/set/save-start-amount`,

  GET_BANK_STATEMENT: `${BASE_URL}/v1/bank-statements`,
  POST_IMPORT_BANK_STATEMENT: `${BASE_URL}/v1/bank-statements/import`,
  POST_COMMIT_IMPORT_BANK_STATEMENT: `${BASE_URL}/v1/bank-statement/`,
  POST_CONFIRM_IMPORT_BANK_STATEMENT: `${BASE_URL}/v1/bank-statements/import/confirm`,
  POST_IMPORT_ACCOUNT: `${BASE_URL}/v1/accounts/import`,
  POST_COMMIT_IMPORT_ACCOUNT: `${BASE_URL}/v1/accounts/commit/import`,
  GET_IMPORT_TEMPLATE_ACCOUNT: `${BASE_URL}/v1/accounts/import/template`,
  GET_EXPORT_ACCOUNT: `${BASE_URL}/v1/accounts/export`,
  POST_RESET_ACCOUNT: `${BASE_URL}/v1/accounts/reset`,

  GET_RECONCILIATION: `${BASE_URL}/v1/reconciliation/`,
  MATCH_RECONCILIATION: `${BASE_URL}/v1/reconciliation/match-multiple`,
  GET_JOURNAL_DETAILS_FOR_RECON: `${BASE_URL}/v1/reconciliation/bank-statements/:bankStatementId/journal-details`,

  ARCHIVE_ACCOUNT: `${BASE_URL}/v1/accounts/:accountId/archive`,

  POST_ADD_ROLE: `${BASE_URL}/v1/access-role/`,
};

export const API_TAGS = {
  GET_ALL_TAGS: `/v1/tags`,
  POST_TAG: `/v1/tags`,
};

export const API_SETTINGS = {
  // General settings
  GET_GENERAL_SETTINGS: `/v1/settings/general-settings`,
  PUT_GENERAL_SETTINGS: `/v1/settings/general-settings`,

  // Account mappings
  GET_ACCOUNT_MAPPINGS: `/v1/settings/account-mappings`,
  POST_SEED_ACCOUNT_MAPPINGS: `/v1/settings/account-mappings/seed`,
  PUT_ACCOUNT_MAPPING: (id: string) => `/v1/settings/account-mappings/${id}`,
  PUT_ACCOUNT_MAPPING_BATCH: `/v1/settings/account-mappings/batch`,

  // Number formats
  GET_NUMBER_FORMATS: `/v1/settings/number-formats`,
  POST_NUMBER_FORMAT: `/v1/settings/number-formats`,
  PUT_NUMBER_FORMAT: (id: string) => `/v1/settings/number-formats/${id}`,
  DELETE_NUMBER_FORMAT: (id: string) => `/v1/settings/number-formats/${id}`,

  // Payment terms
  GET_PAYMENT_TERMS: `/v1/payment-terms`,
  POST_PAYMENT_TERM: `/v1/payment-terms`,
  PUT_PAYMENT_TERM: (id: string) => `/v1/payment-terms/${id}`,
  DELETE_PAYMENT_TERM: (id: string) => `/v1/payment-terms/${id}`,

  // Payment methods
  GET_PAYMENT_METHODS: `/v1/payment-methods`,
  POST_PAYMENT_METHOD: `/v1/payment-methods`,
  PUT_PAYMENT_METHOD: (id: string) => `/v1/payment-methods/${id}`,
  DELETE_PAYMENT_METHOD: (id: string) => `/v1/payment-methods/${id}`,

  // Taxes
  GET_TAXES: `/v1/taxes`,
  POST_TAX: `/v1/taxes`,
  PUT_TAX: (id: string) => `/v1/taxes/${id}`,
  DELETE_TAX: (id: string) => `/v1/taxes/${id}`,

  // Tags
  GET_TAGS: `/v1/tags`,
  POST_TAG: `/v1/tags`,
  PUT_TAG: (id: string) => `/v1/tags/${id}`,
  DELETE_TAG: (id: string) => `/v1/tags/${id}`,
};

export const API_PENDING_CHANGES = {
  GET_ALL: `/v1/pending-changes`,
  GET_COUNT: `/v1/pending-changes/count`,
  APPROVE_CHANGE: (changeId: string) => `/v1/pending-changes/${changeId}/approve`,
  APPROVE_ALL: `/v1/pending-changes/approve-all`,
};
