import type { RouteObject } from 'react-router-dom';
import {
  AddContactPage,
  ContactMainPage,
  DetailContactPage,
  TransactionDetailByContactPage,
} from '@/module/contacts';
import { routes } from '../routes';

export const contactsRoutes: RouteObject[] = [
  { path: routes.contacts.main, element: <ContactMainPage /> },
  { path: routes.contacts.add, element: <AddContactPage /> },
  { path: routes.contacts.detail, element: <DetailContactPage /> },
  { path: routes.contacts.transactions, element: <TransactionDetailByContactPage /> },
];
