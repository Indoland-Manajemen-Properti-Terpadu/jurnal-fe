import { useState } from 'react';
import { Button, Group, Select } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { foundProductOptions } from '@/module/inventory/domain/foundProducts';
import { fetchProducts } from '@/module/products';

const LOOKUP_LIMIT = 100;

type Props = {
  /** Products already on the list; they cannot be added twice. */
  taken: string[];
  saving: boolean;
  onAdd: (productId: string) => void;
};

/** Adds a product that was on the shelf but not on the count list, right above the table. */
export function FoundProductPicker({ taken, saving, onAdd }: Readonly<Props>) {
  const { t } = useTranslation('stockTake');
  const [product, setProduct] = useState<string | null>(null);
  const products = useQuery({
    queryKey: ['inventory', 'found-product-options'],
    queryFn: () => fetchProducts({ page: 1, limit: LOOKUP_LIMIT }),
    staleTime: 60_000,
  });
  const options = foundProductOptions(products.data?.items ?? [], taken);

  return (
    <Group gap="xs" wrap="nowrap" w={{ base: '100%', md: 'auto' }}>
      <Select
        aria-label={t('count.addFoundPick')}
        placeholder={t('count.foundPlaceholder')}
        data={options}
        value={product}
        onChange={setProduct}
        searchable
        clearable
        radius="md"
        w={{ base: '100%', md: 260 }}
        nothingFoundMessage={t('count.empty')}
      />
      <Button
        variant="light"
        leftSection={<IconPlus size={16} />}
        disabled={!product}
        loading={saving}
        onClick={() => {
          if (!product) return;
          onAdd(product);
          setProduct(null);
        }}
        style={{ flexShrink: 0 }}
      >
        {t('count.addFoundConfirm')}
      </Button>
    </Group>
  );
}
