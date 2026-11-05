/** An account as `GET /v1/accounts/simple` returns it: postable accounts only, no balances or category. */
export type SimpleAccount = {
  id: string;
  name: string;
  accountNumber: string;
  type?: string;
  normalBalance?: string;
  isContra?: boolean;
  isHead?: boolean;
  isPostable?: boolean;
};
