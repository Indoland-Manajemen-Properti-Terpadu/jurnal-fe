import { Box, Collapse, Grid, NumberInput, Select, Text, UnstyledButton } from '@mantine/core';
import { IconBuildingWarehouse, IconCheck, IconPackage, IconTool } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import type {
  ProductFormApi,
  SelectOption,
} from '@/module/products/presentation/hooks/useProductForm';
import { FormSection } from './FormSection';

type ChoiceCardProps = {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
};

function ChoiceCard({ selected, icon, title, description, onSelect }: Readonly<ChoiceCardProps>) {
  return (
    <UnstyledButton
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      p="sm"
      style={{
        flex: '1 1 0',
        minWidth: 240,
        borderRadius: 'var(--mantine-radius-md)',
        border: `1.5px solid ${
          selected ? 'var(--mantine-color-primary-6)' : 'var(--mantine-color-gray-3)'
        }`,
        background: selected ? 'var(--mantine-color-primary-0)' : 'var(--mantine-color-white)',
        transition: 'border-color 120ms, background 120ms',
      }}
    >
      <Box style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minHeight: 52 }}>
        <Box c={selected ? 'primary.7' : 'gray.6'} mt={2} style={{ flexShrink: 0 }}>
          {icon}
        </Box>
        <Box style={{ flex: 1 }}>
          <Text size="sm" fw={600} c={selected ? 'primary.9' : 'dark.7'}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" lh={1.4} mt={2}>
            {description}
          </Text>
        </Box>
        <Box w={16} h={16} style={{ flexShrink: 0 }}>
          {selected && <IconCheck size={16} color="var(--mantine-color-primary-6)" />}
        </Box>
      </Box>
    </UnstyledButton>
  );
}

type InventorySectionProps = {
  form: ProductFormApi;
  accountData: SelectOption[];
};

export function InventorySection({ form, accountData }: Readonly<InventorySectionProps>) {
  const { t } = useTranslation('products');
  const tracked = form.values.inventoryInfo.isTracked;
  const setTracked = (value: boolean) => form.setFieldValue('inventoryInfo.isTracked', value);

  return (
    <FormSection
      icon={IconBuildingWarehouse}
      title={t('form.inventoryTitle')}
      description={t('form.inventoryDescription')}
    >
      <Box
        mt="sm"
        pt="sm"
        role="radiogroup"
        aria-label={t('form.inventoryTitle')}
        style={{
          borderTop: '1px solid var(--mantine-color-gray-1)',
          display: 'flex',
          gap: 'var(--mantine-spacing-sm)',
          flexWrap: 'wrap',
        }}
      >
        <ChoiceCard
          selected={tracked}
          icon={<IconPackage size={18} />}
          title={t('form.trackedTitle')}
          description={t('form.trackedDescription')}
          onSelect={() => setTracked(true)}
        />
        <ChoiceCard
          selected={!tracked}
          icon={<IconTool size={18} />}
          title={t('form.untrackedTitle')}
          description={t('form.untrackedDescription')}
          onSelect={() => setTracked(false)}
        />
      </Box>

      <Collapse in={tracked}>
        <Grid gutter="sm" mt="sm" align="flex-end">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.inventoryAccount')}
              description={t('form.inventoryAccountHint')}
              placeholder={t('form.accountPlaceholder')}
              withAsterisk
              data={accountData}
              searchable
              clearable
              nothingFoundMessage={t('form.nothingFound')}
              comboboxProps={{ withinPortal: true }}
              maxDropdownHeight={240}
              size="sm"
              {...form.getInputProps('inventoryInfo.inventoryAccount')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              label={t('form.minStock')}
              description={t('form.minStockHint')}
              placeholder="0"
              min={0}
              allowDecimal={false}
              size="sm"
              {...form.getInputProps('inventoryInfo.minStock')}
            />
          </Grid.Col>
        </Grid>
      </Collapse>
    </FormSection>
  );
}
