import type { ReactNode } from 'react';
import {
  Alert,
  Badge,
  Box,
  Card,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
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

type SettingCardProps = {
  icon: Icon;
  color: string;
  title: string;
  description: string;
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  inactiveNotice: string;
  children: ReactNode;
};

function SettingCard({
  icon: CardIcon,
  color,
  title,
  description,
  active,
  activeLabel,
  inactiveLabel,
  inactiveNotice,
  children,
}: Readonly<SettingCardProps>) {
  return (
    <Card withBorder radius="md" p="lg" bg="white">
      <Group justify="space-between" align="center" mb="md">
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" color={color} variant="light">
            <CardIcon size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" c="primary.9">
              {title}
            </Text>
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </Box>
        </Group>
        <Badge color={active ? color : 'gray'} variant="light">
          {active ? activeLabel : inactiveLabel}
        </Badge>
      </Group>

      {active ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {children}
        </SimpleGrid>
      ) : (
        <Alert color="gray" icon={<IconInfoCircle size={16} />}>
          {inactiveNotice}
        </Alert>
      )}
    </Card>
  );
}

function InfoTile({
  label,
  value,
  valueColor,
  valueWeight = 600,
}: Readonly<{ label: string; value: string; valueColor: string; valueWeight?: number }>) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Text size="xs" c="dimmed" fw={600}>
        {label}
      </Text>
      <Text size="sm" fw={valueWeight} c={valueColor} mt={4}>
        {value}
      </Text>
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
  return (
    <Stack gap="lg">
      <SettingCard
        icon={IconTag}
        color="teal"
        title={t('detail.sellSectionTitle')}
        description={t('detail.sellSectionDescription')}
        active={sellingInfo.isSold}
        activeLabel={t('detail.active')}
        inactiveLabel={t('detail.inactive')}
        inactiveNotice={t('detail.notSoldInfo')}
      >
        <InfoTile
          label={t('detail.salesAccountCredit')}
          value={accountLabel(sellingInfo.salesAccount)}
          valueColor="primary.9"
        />
        <InfoTile
          label={t('detail.receivableAccountDebit')}
          value={accountLabel(sellingInfo.accountReceivable)}
          valueColor="primary.9"
        />
        <InfoTile
          label={t('detail.sellTax')}
          value={taxLabel(sellingInfo.salesTax)}
          valueColor="dark.7"
        />
        <InfoTile
          label={t('detail.standardUnitPrice')}
          value={formatPrice(sellingInfo.unitPrice)}
          valueColor="teal.7"
          valueWeight={700}
        />
      </SettingCard>

      <SettingCard
        icon={IconShoppingCart}
        color="blue"
        title={t('detail.buySectionTitle')}
        description={t('detail.buySectionDescription')}
        active={buyingInfo.isPurchased}
        activeLabel={t('detail.active')}
        inactiveLabel={t('detail.inactive')}
        inactiveNotice={t('detail.notBoughtInfo')}
      >
        <InfoTile
          label={t('detail.purchaseAccountDebit')}
          value={accountLabel(buyingInfo.purchaseAccount)}
          valueColor="primary.9"
        />
        <InfoTile
          label={t('detail.buyTax')}
          value={taxLabel(buyingInfo.purchaseTax)}
          valueColor="dark.7"
        />
        <InfoTile
          label={t('detail.standardBuyPrice')}
          value={formatPrice(buyingInfo.unitPrice)}
          valueColor="blue.7"
          valueWeight={700}
        />
      </SettingCard>

      <SettingCard
        icon={IconBuildingWarehouse}
        color="indigo"
        title={t('detail.inventorySectionTitle')}
        description={t('detail.inventorySectionDescription')}
        active={inventoryInfo.isTracked}
        activeLabel={t('detail.inventoryTracked')}
        inactiveLabel={t('detail.inventoryNonStock')}
        inactiveNotice={t('detail.notTrackedInfo')}
      >
        <InfoTile
          label={t('detail.inventoryAccountAsset')}
          value={accountLabel(inventoryInfo.inventoryAccount)}
          valueColor="primary.9"
        />
        <InfoTile
          label={t('detail.minStockLimit')}
          value={t('detail.unitCount', { count: inventoryInfo.minStock })}
          valueColor="indigo.7"
          valueWeight={700}
        />
      </SettingCard>
    </Stack>
  );
}
