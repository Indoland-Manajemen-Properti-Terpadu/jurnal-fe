import { Box, Group, Radio, SimpleGrid, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { WRITE_OFF_TYPES, type WriteOffType } from '@/module/assets/domain/writeOff';
import { AssetIllustration } from '@/module/assets/presentation/components/AssetIllustration';
import classes from '@/module/assets/presentation/components/WriteOffForm.module.css';

export type WriteOffTypeCardsProps = {
  value: WriteOffType | null;
  onChange: (type: WriteOffType) => void;
  fullyDepreciatedAllowed: boolean;
  error?: string;
};

/** One card per reason an asset leaves the books, each with its drawing and a plain explanation. */
export function WriteOffTypeCards({
  value,
  onChange,
  fullyDepreciatedAllowed,
  error,
}: Readonly<WriteOffTypeCardsProps>) {
  const { t } = useTranslation('assetWriteOffs');
  return (
    <Radio.Group
      value={value ?? ''}
      onChange={(next) => onChange(next as WriteOffType)}
      error={error}
      aria-label={t('sectionType')}
    >
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
        {WRITE_OFF_TYPES.map((type) => {
          const blocked = type === 'fully_depreciated' && !fullyDepreciatedAllowed;
          return (
            <Radio.Card
              key={type}
              value={type}
              disabled={blocked}
              radius="md"
              className={classes.typeCard}
              aria-label={t(`type_${type}`)}
              aria-describedby={`type-hint-${type}`}
            >
              <Group wrap="nowrap" align="flex-start" gap="sm">
                <Box className={classes.typeArt}>
                  <AssetIllustration name={type} maxWidth={56} />
                </Box>
                <Box flex={1} miw={0}>
                  <Group justify="space-between" wrap="nowrap" gap={6}>
                    <Text fw={700} size="sm">
                      {t(`type_${type}`)}
                    </Text>
                    <Radio.Indicator size="sm" />
                  </Group>
                  <Text
                    id={`type-hint-${type}`}
                    size="xs"
                    c={blocked ? 'orange.8' : 'dimmed'}
                    lh={1.4}
                    mt={2}
                  >
                    {blocked ? t('fullyDepreciatedBlocked') : t(`typeHint_${type}`)}
                  </Text>
                </Box>
              </Group>
            </Radio.Card>
          );
        })}
      </SimpleGrid>
    </Radio.Group>
  );
}

export default WriteOffTypeCards;
