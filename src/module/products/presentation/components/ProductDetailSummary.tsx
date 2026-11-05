import { SummaryBar, type SummaryItem } from '@/components/SummaryBar';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { formatPrice } from '@/module/products/domain/productFormat';

type ProductDetailSummaryProps = {
  product: Product;
  taxLabel: (tax: unknown) => string;
};

/** The figures that decide how the product is traded, as one bar above the settings. */
export function ProductDetailSummary({ product, taxLabel }: Readonly<ProductDetailSummaryProps>) {
  const { t } = useTranslation('products');
  const { sellingInfo, buyingInfo, inventoryInfo } = product;

  const items: SummaryItem[] = [
    {
      key: 'sell',
      label: t('detail.sellPrice'),
      value: sellingInfo.isSold ? formatPrice(sellingInfo.unitPrice) : t('detail.notSold'),
      hint: sellingInfo.isSold
        ? t('detail.taxHint', { tax: taxLabel(sellingInfo.salesTax) })
        : t('detail.notSoldHint'),
    },
    {
      key: 'buy',
      label: t('detail.buyPrice'),
      value: buyingInfo.isPurchased ? formatPrice(buyingInfo.unitPrice) : t('detail.notBought'),
      hint: buyingInfo.isPurchased
        ? t('detail.taxHint', { tax: taxLabel(buyingInfo.purchaseTax) })
        : t('detail.notBoughtHint'),
    },
    {
      key: 'unit',
      label: t('detail.unitLabel'),
      value: product.unit ?? '—',
      hint: product.unit ? t('detail.unitHint') : t('detail.unitNoneHint'),
    },
    {
      key: 'stock',
      label: t('detail.stockLabel'),
      value: inventoryInfo.isTracked ? t('detail.stockTracked') : t('detail.nonStock'),
      hint: inventoryInfo.isTracked
        ? t('detail.minStockHint', { count: inventoryInfo.minStock })
        : t('detail.stockOffHint'),
      tone: inventoryInfo.isTracked ? 'success' : 'muted',
    },
  ];

  return <SummaryBar items={items} />;
}
