import type { ReactNode } from 'react';
import { Alert, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  IconBuildingWarehouse,
  IconInfoCircle,
  IconShoppingCart,
  IconTag,
  type Icon,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { formatPrice } from '@/module/products/domain/productFormat';
import { DetailField } from './DetailField';

type SettingCardProps = {
  icon: Icon;
  title: string;
  description: string;
  active: boolean;
  inactiveNotice: string;
  children: ReactNode;
};

function SettingCard({
  icon: CardIcon,
  title,
  description,
  active,
  inactiveNotice,
  children,
}: Readonly<SettingCardProps>) {
  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Group gap="sm" wrap="nowrap" align="flex-start" mb="md">
        <ThemeIcon size={36} radius="md" color="primary" variant="light">
          <CardIcon size={19} />
        </ThemeIcon>
        <div>
          <Title order={3} size="md" lh={1.3}>
            {title}
          </Title>
          <Text size="xs" c="dimmed" mt={2}>
            {description}
          </Text>
        </div>
      </Group>

      {active ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          {children}
        </SimpleGrid>
      ) : (
        <Alert color="gray" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
          {inactiveNotice}
        </Alert>
      )}
    </Paper>
  );
}

type ProductSettingsCardsProps = {
  product: Product;
  accountLabel: (account: unknown) => string;
  taxLabel: (tax: unknown) => string;
};

export function ProductSettingsCards({
  product,
  accountLabel,
  taxLabel,
}: Readonly<ProductSettingsCardsProps>) {
  const { t } = useTranslation('products');
  const { sellingInfo, buyingInfo, inventoryInfo } = product;
  const perUnit = (price: number | null) =>
    product.unit ? `${formatPrice(price)} / ${product.unit}` : formatPrice(price);

  return (
    <Stack gap="lg">
      <SettingCard
        icon={IconTag}
        title={t('detail.sellSectionTitle')}
        description={t('detail.sellSectionDescription')}
        active={sellingInfo.isSold}
        inactiveNotice={t('detail.notSoldInfo')}
      >
        <DetailField label={t('detail.standardUnitPrice')}>
          {perUnit(sellingInfo.unitPrice)}
        </DetailField>
        <DetailField label={t('detail.sellTax')}>{taxLabel(sellingInfo.salesTax)}</DetailField>
        <DetailField label={t('detail.salesAccountCredit')}>
          {accountLabel(sellingInfo.salesAccount)}
        </DetailField>
        <DetailField label={t('detail.receivableAccountDebit')}>
          {accountLabel(sellingInfo.accountReceivable)}
        </DetailField>
      </SettingCard>

      <SettingCard
        icon={IconShoppingCart}
        title={t('detail.buySectionTitle')}
        description={t('detail.buySectionDescription')}
        active={buyingInfo.isPurchased}
        inactiveNotice={t('detail.notBoughtInfo')}
      >
        <DetailField label={t('detail.standardBuyPrice')}>
          {perUnit(buyingInfo.unitPrice)}
        </DetailField>
        <DetailField label={t('detail.buyTax')}>{taxLabel(buyingInfo.purchaseTax)}</DetailField>
        <DetailField label={t('detail.purchaseAccountDebit')}>
          {accountLabel(buyingInfo.purchaseAccount)}
        </DetailField>
      </SettingCard>

      <SettingCard
        icon={IconBuildingWarehouse}
        title={t('detail.inventorySectionTitle')}
        description={t('detail.inventorySectionDescription')}
        active={inventoryInfo.isTracked}
        inactiveNotice={t('detail.notTrackedInfo')}
      >
        <DetailField label={t('detail.inventoryAccountAsset')}>
          {accountLabel(inventoryInfo.inventoryAccount)}
        </DetailField>
        <DetailField label={t('detail.minStockLimit')}>
          {t('detail.unitCount', {
            count: inventoryInfo.minStock,
            unit: product.unit ?? t('detail.unitFallback'),
          })}
        </DetailField>
      </SettingCard>
    </Stack>
  );
}
