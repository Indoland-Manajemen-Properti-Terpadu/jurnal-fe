import { generatePath } from 'react-router-dom';
import { routes } from '@/router/routes';

/** The stock card of a product, for one warehouse or all of them. */
export const stockCardPath = (productId: string, warehouseId?: string): string => {
  const path = generatePath(routes.inventory.stockCard, { productId });
  return warehouseId ? `${path}?warehouse=${warehouseId}` : path;
};

/** The history tab of Stock Movements with some filters already set. */
export const historyPath = (filters: { warehouse?: string; product?: string } = {}): string => {
  const params = new URLSearchParams({ tab: 'history' });
  if (filters.warehouse) params.set('warehouse', filters.warehouse);
  if (filters.product) params.set('product', filters.product);
  return `${routes.inventory.stockMovements}?${params.toString()}`;
};

/** The transfer form, optionally with a source warehouse set and its stock filled in. */
export const transferNewPath = (options: { from?: string; fillAll?: boolean } = {}): string => {
  const params = new URLSearchParams();
  if (options.from) params.set('from', options.from);
  if (options.from && options.fillAll) params.set('fill', 'all');
  const query = params.toString();
  return query ? `${routes.inventory.transferNew}?${query}` : routes.inventory.transferNew;
};

export const transferDetailPath = (id: string): string =>
  generatePath(routes.inventory.transferDetail, { id });

export const stockTakeDetailPath = (id: string): string =>
  generatePath(routes.inventory.stockTakeDetail, { id });

/** The stock count list, optionally narrowed to one warehouse. */
export const stockTakeListPath = (filters: { warehouse?: string } = {}): string =>
  filters.warehouse
    ? `${routes.inventory.stockTake}?warehouse=${filters.warehouse}`
    : routes.inventory.stockTake;

/** The stock count form, optionally with the warehouse already chosen. */
export const stockTakeNewPath = (options: { warehouse?: string } = {}): string =>
  options.warehouse
    ? `${routes.inventory.stockTakeNew}?warehouse=${options.warehouse}`
    : routes.inventory.stockTakeNew;
