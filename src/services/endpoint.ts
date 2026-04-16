export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jurnal-api.proapps.id';
// export const API_AUTH = {
//   POST_LOGIN: `${BASE_URL}/v1/auth/login`,
//   POST_REGISTER: `${BASE_URL}/v1/auth/register`,
// };

// export const API_USERS = {
//   GET_ALL_USER: `${BASE_URL}/v1/users`,
// };

// export const API_ACCESS_ROLE = {
//   GET_DEFAULT_ROLE: `${BASE_URL}/v1/access-role?isDefault=true`,
//   GET_ADDITIONAL_ROLE: `${BASE_URL}/v1/access-role`,
// };

// export const API_SITE = {
//   GET_ALL_SITE: `${BASE_URL}/v1/site/get/by-token`,
//   POST_SITE: `${BASE_URL}/v1/site`,
// };

// export const API_ACCOUNT_BANK = {
//   POST_IMPORT_RECONCILLIATION: `${BASE_URL}/v1/bank-accounts/import/reconciliation`,
// };

// export const API_ACCOUNT = {
//   GET_ALL_ACCOUNT: `${BASE_URL}/v1/accounts`,
//   ADD_ACCOUNT: `${BASE_URL}/v1/accounts`,
//   POST_TRANSACTION_ACCOUNT: `${BASE_URL}/v1/journal`,
// };

export const API_AUTH = {
  POST_LOGIN: `/v1/auth/login`,
  POST_REGISTER: `/v1/auth/register`,
  POST_OAUTH_EXCHANGE: `/api/auth/oauth/exchange`,
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

  GET_DRAFT_BALANCE: `${BASE_URL}/v1/accounts/get/draft-start-amount`,
  POST_DRAFT_BALANCE: `${BASE_URL}/v1/accounts/set/draft-start-amount`,
  POST_PUBLISH_DRAFT_BALANCE: `${BASE_URL}/v1/accounts/set/save-start-amount`,

  GET_BANK_STATEMENT: `${BASE_URL}/v1/bank-statement`,
  POST_IMPORT_BANK_STATEMENT: `${BASE_URL}/v1/bank-statement/import`,
  POST_COMMIT_IMPORT_BANK_STATEMENT: `${BASE_URL}/v1/bank-statement/`,

  GET_RECONCILIATION: `${BASE_URL}/v1/reconciliation/`,

  POST_ADD_ROLE: `${BASE_URL}/v1/access-role/`,
};

export const API_REPORT = {
  GET_JOURNAL_ENTRY_REPORT: `${BASE_URL}/v1/report/journal-entry`,
  GET_BALANCE_SHEET_REPORT: `${BASE_URL}/v1/report/balance`,
  GET_INCOME_STATEMENT_REPORT: `${BASE_URL}/v1/report/income-statement`,
  GET_TRIAL_BALANCE_REPORT: `${BASE_URL}/v1/report/trial-balance`,
  GET_EQUITY_CHANGE_REPORT: `${BASE_URL}/v1/report/equity-changes`,
  GET_GENERAL_JOURNAL_REPORT: `${BASE_URL}/v1/report/general-journal`,
};

export const API_EXPORT_REPORT = {
  EXPORT_REPORT_BS: `${API_REPORT.GET_BALANCE_SHEET_REPORT}/download`,
  EXPORT_REPORT_IS: `${API_REPORT.GET_INCOME_STATEMENT_REPORT}/download`,
  EXPORT_REPORT_EC: `${API_REPORT.GET_EQUITY_CHANGE_REPORT}/download`,
  EXPORT_REPORT_GJ: `${API_REPORT.GET_GENERAL_JOURNAL_REPORT}/download`,
};
