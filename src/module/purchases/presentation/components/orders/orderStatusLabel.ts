/** Translation keys for PO and SPK statuses whose wording depends on the document kind. */
export const orderStatusLabelKey = (status: string, isService: boolean): string | undefined => {
  if (status === 'PARTIAL_RECEIVED') {
    return isService
      ? 'hub.orders.statusLabels.servicePartial'
      : 'hub.orders.statusLabels.goodsPartial';
  }
  if (status === 'RECEIVED') {
    return isService
      ? 'hub.orders.statusLabels.serviceComplete'
      : 'hub.orders.statusLabels.goodsComplete';
  }
  if (status === 'COMPLETED') return 'hub.orders.statusLabels.fullyBilled';
  return undefined;
};
