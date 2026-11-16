import { Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { DocumentType } from '@/module/bank-connection/domain/connectionDocuments';
import ktp from '@/assets/samples/sample-ktp.svg';
import kitas from '@/assets/samples/sample-kitas.svg';
import savingBook from '@/assets/samples/sample-saving-book.svg';

/**
 * What a good document looks like: schematic illustrations with the data blocked out and CONTOH
 * across them. They show the layout only; they are not real documents.
 */
export function DocumentSampleDialog({
  type,
  onClose,
}: Readonly<{ type: DocumentType | null; onClose: () => void }>) {
  const { t } = useTranslation('bankConnection');
  const identity = type === 'IDENTITY';

  return (
    <Modal
      opened={type !== null}
      onClose={onClose}
      title={identity ? t('samples.identityTitle') : t('samples.accountProofTitle')}
      size={identity ? 'lg' : 'md'}
      centered
      transitionProps={{ duration: 0 }}
    >
      {type !== null && (
        <Stack gap="md">
          {identity ? (
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Stack gap={6} align="center">
                <Text fw={600}>{t('samples.ktp')}</Text>
                <img src={ktp} alt={t('samples.ktp')} style={{ width: '100%', maxWidth: 320 }} />
              </Stack>
              <Stack gap={6} align="center">
                <Text fw={600}>{t('samples.kitas')}</Text>
                <img
                  src={kitas}
                  alt={t('samples.kitas')}
                  style={{ width: '100%', maxWidth: 320 }}
                />
              </Stack>
            </SimpleGrid>
          ) : (
            <Stack gap={6} align="center">
              <Text fw={600}>{t('samples.savingBook')}</Text>
              <img
                src={savingBook}
                alt={t('samples.savingBook')}
                style={{ width: '100%', maxWidth: 280 }}
              />
            </Stack>
          )}
          <Text fz="sm" c="dimmed">
            {t('samples.note')}
          </Text>
          <Text fz={12} c="dimmed">
            {t('samples.disclaimer')}
          </Text>
        </Stack>
      )}
    </Modal>
  );
}
