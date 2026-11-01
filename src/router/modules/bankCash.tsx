import type { RouteObject } from 'react-router-dom';
import {
  AddReceiveMoneyPage,
  AddSentMoneyPage,
  AddTransferMoneyPage,
  BankAndCashMainPage,
} from '@/module/bank-cash';
import { routes } from '../routes';

export const bankCashRoutes: RouteObject[] = [
  { path: routes.bankCash.main, element: <BankAndCashMainPage /> },
  { path: routes.bankCash.addTransfer, element: <AddTransferMoneyPage /> },
  { path: routes.bankCash.addReceive, element: <AddReceiveMoneyPage /> },
  { path: routes.bankCash.addSent, element: <AddSentMoneyPage /> },
];
