import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import JournalEntryMeta from './JournalEntryMeta';
import JournalEntrySidebar from './JournalEntrySidebar';
import type { JournalEntryDetail } from '../../domain/journalEntry';

// The server sends `tags` as a list of tag objects, `[]` when there is none, and used to send "-".
const entry = (tags: unknown): JournalEntryDetail =>
  ({
    id: 'j1',
    transactionNumber: '30420',
    transactionDate: '2026-11-03',
    transactionType: 'DEFAULT',
    site: { id: 's', name: 'Demo Site' },
    attachments: [],
    tags,
  }) as JournalEntryDetail;

const tagObject = {
  id: 't1',
  site: 's',
  name: 'ZZ Tag Uji',
  color: '#3B82F6',
  deleted: false,
  createdAt: '2026-11-04T13:05:49.150Z',
  updatedAt: '2026-11-04T13:05:49.150Z',
};

const renderMeta = (tags: unknown) =>
  render(
    <MemoryRouter>
      <JournalEntryMeta entry={entry(tags)} />
    </MemoryRouter>
  );

const renderSidebar = (tags: unknown) =>
  render(
    <MemoryRouter>
      <JournalEntrySidebar entry={entry(tags)} />
    </MemoryRouter>
  );

describe('journal detail with tags as objects', () => {
  it('the meta line shows the tag name instead of crashing', () => {
    renderMeta([tagObject]);
    expect(screen.getByText('ZZ Tag Uji')).toBeInTheDocument();
  });

  it('the sidebar shows the tag name instead of crashing', () => {
    renderSidebar([tagObject]);
    expect(screen.getByText('ZZ Tag Uji')).toBeInTheDocument();
  });

  it('shows no tag label for an empty list or the old "-" value', () => {
    renderMeta([]);
    expect(screen.queryByText('Tag:')).not.toBeInTheDocument();
    renderMeta('-');
    expect(screen.queryByText('Tag:')).not.toBeInTheDocument();
  });
});
