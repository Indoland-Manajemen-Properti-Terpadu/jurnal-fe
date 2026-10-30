// Single bridge to the sales formatter: sales cannot be imported through its index at runtime
// without a module cycle (its pages import this module).
export { formatIDR } from '@/module/sales/domain/saleFormat';
