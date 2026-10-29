import type { FormEvent } from 'react';
import { Badge, Button, Group, Modal, Text, TextInput, ThemeIcon } from '@mantine/core';
import { IconBook2, IconCircleCheckFilled, IconDownload } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { EbookItem } from './ebookData';

interface EbookModalProps {
  opened: boolean;
  ebook: EbookItem | null;
  email: string;
  isSuccess: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
  onOpenPdf: () => void;
}

export function EbookModal({
  opened,
  ebook,
  email,
  isSuccess,
  onEmailChange,
  onSubmit,
  onClose,
  onOpenPdf,
}: EbookModalProps) {
  const { t } = useTranslation('landing');

  const title = ebook ? t(`ebooks.items.${ebook.id}.title`) : '';
  const meta = ebook
    ? t('ebooks.modal.metaLine', {
        pages: t('ebooks.pagesLabel', { count: ebook.pages }),
        readTime: t('ebooks.readTimeLabel', { count: ebook.readMinutes }),
      })
    : '';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconBook2 size={20} color="var(--lp-navy)" />
          <Text fw={750} fz="sm">
            {t('ebooks.modal.title')}
          </Text>
        </Group>
      }
      radius="lg"
      size="md"
      centered
    >
      {ebook && (
        <div>
          {!isSuccess ? (
            <form onSubmit={onSubmit}>
              <div
                style={{
                  background: ebook.gradient,
                  padding: '20px',
                  borderRadius: 12,
                  color: '#fff',
                  marginBottom: 16,
                }}
              >
                <Badge size="xs" color="white" variant="white" c="dark.8" mb="xs">
                  {t(`ebooks.items.${ebook.id}.tag`)}
                </Badge>
                <Text fw={800} fz="md" lh={1.3}>
                  {title}
                </Text>
                <Text fz="xs" style={{ opacity: 0.9, marginTop: 6 }}>
                  {meta}
                </Text>
              </div>

              <Text fz="xs" c="dimmed" mb="md">
                {t('ebooks.modal.intro')}
              </Text>

              <TextInput
                label={t('ebooks.modal.emailLabel')}
                placeholder={t('ebooks.modal.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => onEmailChange(e.currentTarget.value)}
                size="md"
                radius="md"
                mb="lg"
              />

              <Group justify="flex-end" gap="sm">
                <Button variant="default" radius="md" onClick={onClose}>
                  {t('ebooks.modal.cancel')}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  radius="md"
                  leftSection={<IconDownload size={16} />}
                >
                  {t('ebooks.modal.submit')}
                </Button>
              </Group>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <ThemeIcon
                size={60}
                radius="xl"
                color="teal"
                variant="light"
                style={{ margin: '0 auto 16px' }}
              >
                <IconCircleCheckFilled size={36} />
              </ThemeIcon>
              <Text fw={800} fz="lg" c="dark.8">
                {t('ebooks.modal.successTitle')}
              </Text>
              <Text fz="sm" c="dimmed" mt="xs" mb="lg">
                {t('ebooks.modal.sentBefore')} <strong>{title}</strong>{' '}
                {t('ebooks.modal.sentAfter')}{' '}
                <span style={{ color: 'var(--lp-navy)', fontWeight: 600 }}>{email}</span>.
              </Text>

              <Button fullWidth color="primary" radius="md" onClick={onOpenPdf}>
                {t('ebooks.modal.openPdf')}
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
