import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  MOCK_CASH_COUNTS,
  MOCK_PETTY_CASH_FUNDS,
  MOCK_REIMBURSEMENTS,
  MOCK_VOUCHERS,
} from '@/module/petty-cash/infrastructure/mockPettyCashData';
import {
  recordPaidVoucher,
  submitReplenishment,
  type PettyCashPrototypeState,
} from '@/module/petty-cash/domain/pettyCash';
import type {
  PettyCashCount,
  PettyCashReimbursement,
  PettyCashVoucher,
} from '@/module/petty-cash/domain/pettyCashTypes';

interface PettyCashPrototypeContextValue extends PettyCashPrototypeState {
  createPaidVoucher: (voucher: Omit<PettyCashVoucher, 'id' | 'createdAt'>) => void;
  submitReimbursement: (reimbursement: PettyCashReimbursement) => void;
  recordCashCount: (count: PettyCashCount) => void;
}

const PettyCashPrototypeContext = createContext<PettyCashPrototypeContextValue | null>(null);

const initialState: PettyCashPrototypeState = {
  funds: MOCK_PETTY_CASH_FUNDS,
  vouchers: MOCK_VOUCHERS,
  reimbursements: MOCK_REIMBURSEMENTS,
  cashCounts: MOCK_CASH_COUNTS,
};

export function PettyCashPrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  const value = useMemo<PettyCashPrototypeContextValue>(
    () => ({
      ...state,
      createPaidVoucher: (draft) => {
        const voucher: PettyCashVoucher = {
          ...draft,
          id: `voucher-${Date.now()}`,
          status: 'PAID',
          createdAt: new Date().toISOString(),
        };
        setState((current) => recordPaidVoucher(current, voucher));
      },
      submitReimbursement: (reimbursement) => {
        setState((current) => submitReplenishment(current, reimbursement));
      },
      recordCashCount: (count) => {
        setState((current) => ({
          ...current,
          cashCounts: [count, ...current.cashCounts],
          funds: current.funds.map((fund) =>
            fund.id === count.fundId ? { ...fund, lastOpnameDate: count.date } : fund
          ),
        }));
      },
    }),
    [state]
  );

  return (
    <PettyCashPrototypeContext.Provider value={value}>
      {children}
    </PettyCashPrototypeContext.Provider>
  );
}

export function usePettyCashPrototype() {
  const context = useContext(PettyCashPrototypeContext);
  if (!context) {
    throw new Error('usePettyCashPrototype must be used within PettyCashPrototypeProvider');
  }
  return context;
}
