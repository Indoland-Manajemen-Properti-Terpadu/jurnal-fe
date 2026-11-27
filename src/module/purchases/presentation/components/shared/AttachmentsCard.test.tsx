import { render, screen } from '@test-utils';
import type { Attachment } from '@/module/purchases/domain/purchaseCommon';
import { AttachmentsCard } from './AttachmentsCard';

vi.mock('@/module/purchases/presentation/hooks/usePurchaseMutations', () => ({
  useUploadAttachments: () => ({ isPending: false, mutate: vi.fn() }),
}));

const file: Attachment = {
  id: 'attachment-1',
  name: 'bukti-transfer-0014.pdf',
  url: 'https://api.example.test/uploads/bukti-transfer-0014.pdf',
  mimeType: 'application/pdf',
  kind: 'OTHER',
  kindLabel: '',
};

describe('AttachmentsCard reference file actions', () => {
  it('shows the file count and accessible preview, download, and share actions', () => {
    render(
      <AttachmentsCard
        target="payment"
        documentId="payment-1"
        attachments={[file]}
        canUpload={false}
        titleKey="paymentRequests.detail.transferProofTitle"
        subtitleKey="paymentRequests.detail.transferProofSubtitle"
        showCount
        showFileActions
      />
    );

    expect(screen.getByText('1 berkas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat berkas' })).toHaveAttribute('href', file.url);
    expect(screen.getByRole('link', { name: 'Unduh berkas' })).toHaveAttribute(
      'download',
      file.name
    );
    expect(screen.getByRole('button', { name: 'Bagikan berkas' })).toBeInTheDocument();
  });
});
