import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { getAttachmentLink } from '@/module/petty-cash/infrastructure/pettyCashApi';

/**
 * Opens a receipt in a new tab. The tab is opened first, inside the click, so popup blockers
 * allow it; it is pointed at the signed link once the backend has issued it.
 */
export const useOpenAttachment = () => {
  const { t } = useTranslation('pettyCash');
  const [openingId, setOpeningId] = useState<string | null>(null);

  const open = async (attachmentId: string) => {
    const tab = window.open('about:blank', '_blank');
    setOpeningId(attachmentId);
    try {
      const { url } = await getAttachmentLink(attachmentId);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.assign(url);
      }
    } catch {
      tab?.close();
      notifications.show({ color: 'orange', message: t('drawer.attachmentFailed') });
    } finally {
      setOpeningId(null);
    }
  };

  return { open, openingId };
};
