import { Button, Container, Flex, Image, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import importTemplateImage from '@/assets/images/illustrations/import-template.svg';

const TEMPLATE_URL = '/templates/csv/bank-statement-template.csv';
const TEMPLATE_DOWNLOAD_NAME = 'Bank Statement Template ProApps.csv';

const downloadTemplate = () => {
  const link = document.createElement('a');
  link.href = TEMPLATE_URL;
  link.download = TEMPLATE_DOWNLOAD_NAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ImportStepDownload = () => {
  const { t } = useTranslation('bankStatements');
  return (
    <Container fluid pt={40} pb={20}>
      <Flex gap="md" justify="center" align="center" direction="column">
        <Image
          src={importTemplateImage}
          w={200}
          h="auto"
          fallbackSrc="https://placehold.co/200x200?text=Illustration"
        />
        <Text ta="center" fw={600} fz="var(--jurnal-text-lg)" c={themeColors.black[9]}>
          {t('importModal.download.heading')}
        </Text>
        <Text ta="center" fw={400} fz="var(--jurnal-text-sm)" c={themeColors.gray[7]} maw={800}>
          {t('importModal.download.body')}
        </Text>
        <Button
          mt="md"
          color={themeColors.blue[6]}
          leftSection={<IconDownload size={18} />}
          onClick={downloadTemplate}
        >
          {t('importModal.download.button')}
        </Button>
      </Flex>
    </Container>
  );
};

export default ImportStepDownload;
