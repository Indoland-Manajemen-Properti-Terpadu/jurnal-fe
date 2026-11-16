import { render, screen, userEvent } from '@test-utils';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentsField } from '@/module/bank-cash/presentation/components/transaction-form/AttachmentsField';

function Harness() {
  const [files, setFiles] = useState<File[]>([]);
  return <AttachmentsField files={files} onChange={setFiles} />;
}

const pdf = (name: string, size = 2048) =>
  new File([new Uint8Array(size)], name, { type: 'application/pdf' });

const upload = async (container: HTMLElement, ...files: File[]) => {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(input, files);
};

describe('AttachmentsField', () => {
  it('renders valid markup (the drop area text sits inside a paragraph)', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Harness />);
    const nesting = error.mock.calls.filter((call) =>
      String(call[0]).includes('validateDOMNesting')
    );
    error.mockRestore();
    expect(nesting).toEqual([]);
  });

  it('says the attachments are optional and what is accepted', () => {
    render(<Harness />);
    expect(screen.getByText(/opsional/i)).toBeTruthy();
    expect(screen.getByText(/30 MB/)).toBeTruthy();
  });

  it('lists a chosen file with its size and lets the user remove it', async () => {
    const { container } = render(<Harness />);
    await upload(container, pdf('nota.pdf', 2048));

    expect(await screen.findByText('nota.pdf')).toBeTruthy();
    expect(screen.getByText('2 KB')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: /Hapus nota\.pdf/ }));
    expect(screen.queryByText('nota.pdf')).toBeNull();
  });

  it('shows megabytes for a larger file', async () => {
    const { container } = render(<Harness />);
    await upload(container, pdf('besar.pdf', 3 * 1024 * 1024));
    expect(await screen.findByText('3 MB')).toBeTruthy();
  });

  it('does not list the same file twice', async () => {
    const { container } = render(<Harness />);
    await upload(container, pdf('nota.pdf'));
    await upload(container, pdf('nota.pdf'));
    expect(await screen.findAllByText('nota.pdf')).toHaveLength(1);
  });
});
