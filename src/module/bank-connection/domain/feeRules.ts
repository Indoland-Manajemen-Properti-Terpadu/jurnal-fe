/** How a bank charges for the connection (docs/prd/bank-connection.md, 5.6 and 7.1). */
export interface FeeRule {
  /** Monthly charge in rupiah. */
  monthly: number;
  /** Refreshes of the transactions included in the monthly charge. */
  includedRefreshes: number;
  /** Charge in rupiah for each refresh beyond the included ones. */
  extraRefreshFee: number;
  /** How many of the included refreshes Jurnal uses itself, automatically, each month. */
  autoRefreshes: number;
  /** The bank takes the charge by automatic debit. */
  autoDebit: boolean;
}

/**
 * Placeholder rules for the banks offered before the backend sends its own list (BCA corporate
 * only). The figures stand in until the price is decided (PRD, decision 12.3); the backend's
 * `feeRules` replace them.
 */
export const LOCAL_FEE_RULES: Record<string, { CORPORATE?: FeeRule; INDIVIDUAL?: FeeRule }> = {
  '014': {
    CORPORATE: {
      monthly: 50_000,
      includedRefreshes: 500,
      extraRefreshFee: 100,
      autoRefreshes: 180,
      autoDebit: true,
    },
  },
};

export interface RefreshUsage {
  used: number;
  included: number;
  /** Charge in rupiah for each refresh beyond the included ones, when the backend states it. */
  extraRefreshFee?: number;
}

/** How much of the month's included refreshes is used, what is left and how many went over. */
export const usageOf = ({
  used,
  included,
}: Pick<RefreshUsage, 'used' | 'included'>): { left: number; over: number; percent: number } => ({
  left: Math.max(0, included - used),
  over: Math.max(0, used - included),
  percent: included > 0 ? Math.min(100, Math.round((used / included) * 100)) : 100,
});
