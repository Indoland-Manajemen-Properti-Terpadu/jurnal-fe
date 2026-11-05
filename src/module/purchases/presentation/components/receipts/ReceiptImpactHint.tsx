import { Accordion, Text } from '@mantine/core';
import { IconBulb } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

/** What receiving does to the books, folded away until someone asks. */
export const ReceiptImpactHint = () => {
  const { t } = useTranslation('purchases');
  return (
    <Accordion variant="contained" radius="md">
      <Accordion.Item value="impact">
        <Accordion.Control icon={<IconBulb size={16} />}>
          <Text size="sm" fw={600}>
            {t('receipts.form.impactTitle')}
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Text size="sm" c="dimmed" lh={1.55}>
            {t('receipts.form.impactBody')}
          </Text>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
