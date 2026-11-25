import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { readBackState } from '@/router/backState';
import { DocumentNumber } from './documentCells';

const Arrived = () => {
  const back = readBackState(useLocation().state);
  return <p>{back ? `${back.backLabel} -> ${back.backTo}` : 'no back state'}</p>;
};

describe('DocumentNumber', () => {
  it('opens the receipt of a movement and remembers the page and filters it came from', async () => {
    render(
      <MemoryRouter initialEntries={['/inventory/stock-movements?tab=history&warehouse=w1']}>
        <Routes>
          <Route
            path="/inventory/stock-movements"
            element={
              <DocumentNumber sourceType="GoodsReceipt" sourceId="gr1" number="FPB/2026/11/0004" />
            }
          />
          <Route path="/purchases/receipts/:id" element={<Arrived />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('link', { name: 'FPB/2026/11/0004' }));

    expect(
      await screen.findByText(
        'Kembali ke mutasi stok -> /inventory/stock-movements?tab=history&warehouse=w1'
      )
    ).toBeInTheDocument();
  });

  it('shows a plain number for a source that has no page here', () => {
    render(
      <MemoryRouter>
        <DocumentNumber sourceType="Opening" sourceId="x" number="OB-1" />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('OB-1')).toBeInTheDocument();
  });
});
