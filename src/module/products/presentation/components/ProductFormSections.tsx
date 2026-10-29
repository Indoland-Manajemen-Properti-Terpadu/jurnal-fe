import {
  ActionIcon,
  Box,
  Collapse,
  Grid,
  Group,
  NumberInput,
  Select,
  Switch,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconBuildingWarehouse, IconPlus, IconShoppingCart, IconTag } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import type {
  ProductFormApi,
  SelectOption,
} from '@/module/products/presentation/hooks/useProductForm';
import { FormSection } from './FormSection';

type SectionProps = {
  form: ProductFormApi;
};

type LookupProps = SectionProps & {
  accountData: SelectOption[];
  taxData: SelectOption[];
};

const selectProps = (nothingFoundMessage: string) =>
  ({
    searchable: true,
    clearable: true,
    nothingFoundMessage,
    comboboxProps: { withinPortal: true, transitionProps: { duration: 150 } },
    maxDropdownHeight: 240,
    size: 'sm',
  }) as const;

function SectionBody({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Box mt="sm" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-1)' }}>
      {children}
    </Box>
  );
}

export function GeneralSection({
  form,
  categoryData,
  categoriesLoading,
  onCreateCategory,
}: Readonly<
  SectionProps & {
    categoryData: SelectOption[];
    categoriesLoading: boolean;
    onCreateCategory: () => void;
  }
>) {
  const { t } = useTranslation('products');
  return (
    <FormSection
      icon={IconTag}
      title={t('form.basicTitle')}
      description={t('form.basicDescription')}
    >
      <SectionBody>
        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, sm: 7 }}>
            <TextInput
              label={t('form.name')}
              placeholder={t('form.namePlaceholder')}
              withAsterisk
              size="sm"
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 5 }}>
            <TextInput
              label={t('form.sku')}
              placeholder={t('form.skuPlaceholder')}
              size="sm"
              {...form.getInputProps('sku')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group align="flex-end" gap={6} wrap="nowrap">
              <Select
                label={t('form.category')}
                placeholder={
                  categoriesLoading ? t('form.categoryLoading') : t('form.categoryPlaceholder')
                }
                withAsterisk
                data={categoryData}
                style={{ flex: 1 }}
                {...selectProps(t('form.nothingFound'))}
                {...form.getInputProps('productCategory')}
              />
              <Tooltip label={t('form.newCategory')}>
                <ActionIcon
                  size={36}
                  variant="light"
                  color="primary"
                  aria-label={t('form.newCategory')}
                  onClick={onCreateCategory}
                  mb={form.errors.productCategory ? 20 : 0}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Grid.Col>
        </Grid>
      </SectionBody>
    </FormSection>
  );
}

export function SalesSection({ form, accountData, taxData }: Readonly<LookupProps>) {
  const { t } = useTranslation('products');
  const common = selectProps(t('form.nothingFound'));
  return (
    <FormSection
      icon={IconTag}
      title={t('form.sellTitle')}
      description={t('form.sellDescription')}
      toggle={
        <Switch
          color="primary"
          size="sm"
          aria-label={t('form.sellSwitch')}
          {...form.getInputProps('sellingInfo.isSold', { type: 'checkbox' })}
        />
      }
    >
      <Collapse in={form.values.sellingInfo.isSold}>
        <SectionBody>
          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label={t('form.sellPrice')}
                prefix="Rp "
                thousandSeparator="."
                decimalSeparator=","
                min={0}
                withAsterisk
                hideControls
                size="sm"
                {...form.getInputProps('sellingInfo.unitPrice')}
                onChange={(v) =>
                  form.setFieldValue('sellingInfo.unitPrice', v === '' ? null : Number(v))
                }
                value={form.values.sellingInfo.unitPrice ?? ''}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={t('form.sellTax')}
                placeholder={t('form.noTax')}
                data={taxData}
                {...common}
                {...form.getInputProps('sellingInfo.salesTax')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={t('form.salesAccount')}
                placeholder={t('form.salesAccountPlaceholder')}
                withAsterisk
                data={accountData}
                {...common}
                {...form.getInputProps('sellingInfo.salesAccount')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={t('form.receivableAccount')}
                placeholder={t('form.receivableAccountPlaceholder')}
                withAsterisk
                data={accountData}
                {...common}
                {...form.getInputProps('sellingInfo.accountReceivable')}
              />
            </Grid.Col>
          </Grid>
        </SectionBody>
      </Collapse>
    </FormSection>
  );
}

export function PurchasingSection({ form, accountData, taxData }: Readonly<LookupProps>) {
  const { t } = useTranslation('products');
  const common = selectProps(t('form.nothingFound'));
  return (
    <FormSection
      icon={IconShoppingCart}
      title={t('form.buyTitle')}
      description={t('form.buyDescription')}
      toggle={
        <Switch
          color="primary"
          size="sm"
          aria-label={t('form.buySwitch')}
          {...form.getInputProps('buyingInfo.isPurchased', { type: 'checkbox' })}
        />
      }
    >
      <Collapse in={form.values.buyingInfo.isPurchased}>
        <SectionBody>
          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label={t('form.buyPrice')}
                prefix="Rp "
                thousandSeparator="."
                decimalSeparator=","
                min={0}
                withAsterisk
                hideControls
                size="sm"
                {...form.getInputProps('buyingInfo.unitPrice')}
                onChange={(v) =>
                  form.setFieldValue('buyingInfo.unitPrice', v === '' ? null : Number(v))
                }
                value={form.values.buyingInfo.unitPrice ?? ''}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label={t('form.purchaseAccount')}
                placeholder={t('form.accountPlaceholder')}
                withAsterisk
                data={accountData}
                {...common}
                {...form.getInputProps('buyingInfo.purchaseAccount')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label={t('form.buyTax')}
                placeholder={t('form.noTax')}
                data={taxData}
                {...common}
                {...form.getInputProps('buyingInfo.purchaseTax')}
              />
            </Grid.Col>
          </Grid>
        </SectionBody>
      </Collapse>
    </FormSection>
  );
}

export function InventorySection({
  form,
  accountData,
}: Readonly<SectionProps & { accountData: SelectOption[] }>) {
  const { t } = useTranslation('products');
  const common = selectProps(t('form.nothingFound'));
  return (
    <FormSection
      icon={IconBuildingWarehouse}
      title={t('form.inventoryTitle')}
      description={t('form.inventoryDescription')}
      toggle={
        <Switch
          color="primary"
          size="sm"
          aria-label={t('form.inventorySwitch')}
          {...form.getInputProps('inventoryInfo.isTracked', { type: 'checkbox' })}
        />
      }
    >
      <Collapse in={form.values.inventoryInfo.isTracked}>
        <SectionBody>
          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Select
                label={t('form.inventoryAccount')}
                placeholder={t('form.accountPlaceholder')}
                withAsterisk
                data={accountData}
                {...common}
                {...form.getInputProps('inventoryInfo.inventoryAccount')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label={t('form.minStock')}
                placeholder="0"
                min={0}
                allowDecimal={false}
                size="sm"
                {...form.getInputProps('inventoryInfo.minStock')}
              />
            </Grid.Col>
          </Grid>
        </SectionBody>
      </Collapse>
    </FormSection>
  );
}
