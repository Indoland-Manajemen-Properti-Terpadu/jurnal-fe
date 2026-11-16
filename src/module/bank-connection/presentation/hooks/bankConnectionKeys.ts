/** Every key starts with the user (scope) and the module name. */
export const bankConnectionKeys = {
  all: (scope: string) => ['bank-connection', scope] as const,
  providers: (scope: string) => ['bank-connection', scope, 'providers'] as const,
  byAccount: (scope: string, accountId: string) =>
    ['bank-connection', scope, 'by-account', accountId] as const,
  detail: (scope: string, id: string) => ['bank-connection', scope, 'detail', id] as const,
  syncRuns: (scope: string, id: string) => ['bank-connection', scope, 'sync-runs', id] as const,
  events: (scope: string, id: string) => ['bank-connection', scope, 'events', id] as const,
};
