interface FoundCandidate {
  id: string;
  name: string;
  sku?: string | null;
  inventoryInfo?: { isTracked?: boolean } | null;
}

/**
 * The products that can be added to a count as "found on the shelf": only those whose stock is
 * tracked (a service has no shelf), and none that is already on the list.
 */
export const foundProductOptions = (
  products: readonly FoundCandidate[],
  taken: readonly string[]
): { value: string; label: string }[] =>
  products
    .filter((item) => item.inventoryInfo?.isTracked === true && !taken.includes(item.id))
    .map((item) => ({
      value: item.id,
      label: item.sku ? `${item.name} · ${item.sku}` : item.name,
    }));
