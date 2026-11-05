import { Radio, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { ProcurementMode } from '@/module/purchases/domain/purchaseDocuments';

const MODES: ProcurementMode[] = ['DIRECT', 'WITH_QUOTATION'];

interface RequestModeCardsProps {
  value: ProcurementMode;
  onChange: (mode: ProcurementMode) => void;
}

/** Two choices with one line of explanation each. */
export const RequestModeCards = ({ value, onChange }: Readonly<RequestModeCardsProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <Radio.Group
      value={value}
      onChange={(next) => onChange(next as ProcurementMode)}
      aria-label={t('requests.form.modeTitle')}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {MODES.map((mode) => {
          const active = value === mode;
          return (
            <UnstyledButton
              key={mode}
              component="label"
              p="md"
              style={{
                border: `1px solid var(--mantine-color-${active ? 'primary-6' : 'gray-3'})`,
                borderRadius: 'var(--mantine-radius-md)',
                background: active ? 'var(--mantine-color-primary-0)' : undefined,
                cursor: 'pointer',
              }}
            >
              <Radio
                value={mode}
                label={
                  <Text fw={600} size="sm">
                    {t(`requests.form.mode.${mode}`)}
                  </Text>
                }
                description={t(`requests.form.mode.${mode}Hint`)}
              />
            </UnstyledButton>
          );
        })}
      </SimpleGrid>
    </Radio.Group>
  );
};
