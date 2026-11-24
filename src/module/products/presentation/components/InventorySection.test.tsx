import { render, screen } from '@test-utils';
import { useForm } from '@mantine/form';
import { describe, expect, it } from 'vitest';
import type { ProductFormApi } from '@/module/products/presentation/hooks/useProductForm';
import { InventorySection } from './InventorySection';

function Harness({ locked }: Readonly<{ locked: boolean }>) {
  const form = useForm({
    initialValues: {
      inventoryInfo: { isTracked: true, inventoryAccount: null, minStock: 0 },
    },
  });
  return (
    <InventorySection form={form as unknown as ProductFormApi} accountData={[]} locked={locked} />
  );
}

describe('InventorySection', () => {
  it('lets the person switch between tracked and not tracked', () => {
    render(<Harness locked={false} />);
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeEnabled());
  });

  it('locks both choices while the product is being counted', () => {
    render(<Harness locked />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    radios.forEach((radio) => expect(radio).toBeDisabled());
  });
});
