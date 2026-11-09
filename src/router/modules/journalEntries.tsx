import type { RouteObject } from 'react-router-dom';
import {
  AddJournalEntryPage,
  JournalEntryDetailPage,
  JournalHistoryPage,
} from '@/module/journal-entries';
import { routes } from '../routes';

export const journalEntriesRoutes: RouteObject[] = [
  { path: routes.journalEntries.main, element: <JournalHistoryPage /> },
  { path: routes.journalEntries.add, element: <AddJournalEntryPage /> },
  { path: routes.journalEntries.detail, element: <JournalEntryDetailPage /> },
];
