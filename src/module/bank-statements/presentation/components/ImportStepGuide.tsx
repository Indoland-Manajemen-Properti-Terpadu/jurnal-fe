import { Container, Flex, Stack, Text } from '@mantine/core';
import { IconBulb } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { InformationAlert } from '@/components/Alert/Alert';

const IMPORTANT_KEYS = [
  'dateFormat',
  'maxRows',
  'noThousands',
  'decimalPoint',
  'noCurrency',
  'keepColumns',
];

const ImportStepGuide = () => {
  const { t } = useTranslation('bankStatements');
  return (
    <Container fluid pt={20} pb={20}>
      <Stack gap="xl">
        <Flex gap="xs" justify="center" align="center" direction="column">
          <Text ta="center" fw={600} fz="var(--jurnal-text-lg)" c={themeColors.black[9]}>
            {t('importModal.guide.heading')}
          </Text>
          <Text ta="center" fw={400} fz="var(--jurnal-text-sm)" c={themeColors.gray[7]} maw={800}>
            {t('importModal.guide.body')}
          </Text>
        </Flex>
        <InformationAlert
          title={t('importModal.guide.importantTitle')}
          color="blue"
          items={IMPORTANT_KEYS.map((key) => t(`importModal.guide.important.${key}`))}
        />
        <InformationAlert
          title={t('importModal.guide.tipsTitle')}
          color="yellow"
          variant="normal"
          icon={<IconBulb />}
          items={[t('importModal.guide.tip')]}
        />
      </Stack>
    </Container>
  );
};

export default ImportStepGuide;
