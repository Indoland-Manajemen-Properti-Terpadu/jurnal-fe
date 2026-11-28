import type { RouteObject } from 'react-router-dom';
import { AddJournalEntryPage } from '@/module/journal-entries/presentation/pages/AddJournalEntryPage';
import { JournalEntryDetailPage } from '@/module/journal-entries/presentation/pages/JournalEntryDetailPage';
import JournalHistoryPage from '@/module/journal-entries/presentation/pages/JournalHistoryPage';
import { routes } from '../routes';

export const journalEntriesRoutes: RouteObject[] = [
  { path: routes.journalEntries.main, element: <JournalHistoryPage /> },
  { path: routes.journalEntries.add, element: <AddJournalEntryPage /> },
  { path: routes.journalEntries.detail, element: <JournalEntryDetailPage /> },
];
