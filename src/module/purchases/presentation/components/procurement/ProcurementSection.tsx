import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import type { PurchaseRequest, ProcurementRoute } from '@/module/purchases/domain/purchaseRequest';
import { procurementToInput } from '@/module/purchases/domain/procurement';
import { ProcurementPanel } from '@/module/purchases/presentation/components/procurement/ProcurementPanel';
import { ProcurementRoutePicker } from '@/module/purchases/presentation/components/procurement/ProcurementRoutePicker';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useSaveProcurement } from '@/module/purchases/presentation/hooks/usePurchaseMutations';

/**
 * Where a verified request goes next: choose the route first (it moves the request into procurement),
 * then gather quotes, pick the winner and send it for approval.
 */
export const ProcurementSection = ({ request }: Readonly<{ request: PurchaseRequest }>) => {
  const { t } = useTranslation('purchases');
  const { can } = usePurchaseAccess();
  const save = useSaveProcurement();
  const fill = can(PURCHASE_MENU.documents, 'update');

  if (request.status === 'VERIFIED' && request.route === null) {
    if (!fill) {
      return (
        <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
          {t('procurement.waitingForProcurement')}
        </Alert>
      );
    }
    const pick = (route: ProcurementRoute) =>
      save.mutate({ id: request.id, input: procurementToInput(request.procurement, route) });
    return <ProcurementRoutePicker loading={save.isPending} onPick={pick} />;
  }

  if (request.status !== 'IN_PROCUREMENT' && request.status !== 'COMPLETED') return null;

  return (
    <ProcurementPanel
      request={request}
      rights={{
        fill,
        createOrder: can(PURCHASE_MENU.documents, 'create'),
        approve: can(PURCHASE_MENU.approveProcurement, 'update'),
      }}
    />
  );
};
