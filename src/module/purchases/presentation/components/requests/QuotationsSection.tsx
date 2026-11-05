import { useState } from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { IconPlus, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';
import {
  emptyQuotation,
  isQuotationExpired,
  lowestQuotationId,
  quotationToForm,
  toQuotationInputs,
  type QuotationFormValues,
} from '@/module/purchases/domain/quotationForm';
import { QuotationCard } from '@/module/purchases/presentation/components/requests/QuotationCard';
import { QuotationEditorModal } from '@/module/purchases/presentation/components/requests/QuotationEditorModal';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import {
  useSaveQuotations,
  useSelectQuotation,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';

interface QuotationsSectionProps {
  request: PurchaseRequest;
  /** The user may change quotations and choose the vendor (JP-PURCH update). */
  canEdit: boolean;
  fillQuotations: boolean;
  selectVendor: boolean;
}

/** Quotations per vendor side by side, the cheapest marked, and the choice of one vendor. */
export const QuotationsSection = ({
  request,
  canEdit,
  fillQuotations,
  selectVendor,
}: Readonly<QuotationsSectionProps>) => {
  const { t } = useTranslation('purchases');
  const save = useSaveQuotations();
  const select = useSelectQuotation();
  const [editing, setEditing] = useState<QuotationFormValues | null>(null);

  const today = todayIso();
  const lowest = lowestQuotationId(request.quotations);
  const lowestTotal = request.quotations.find((item) => item.id === lowest)?.total ?? 0;
  const allForms = request.quotations.map(quotationToForm);
  const mayEdit = canEdit && fillQuotations;

  const persist = (forms: QuotationFormValues[], done?: () => void) =>
    save.mutate(
      { id: request.id, quotations: toQuotationInputs(forms, request) },
      { onSuccess: done }
    );

  const onSave = (values: QuotationFormValues) => {
    const exists = allForms.some((form) => form.key === values.key);
    const next = exists
      ? allForms.map((form) => (form.key === values.key ? values : form))
      : [...allForms, values];
    persist(next, () => setEditing(null));
  };

  return (
    <SectionCard
      icon={IconScale}
      title={t('requests.quotation.title')}
      subtitle={t('requests.quotation.subtitle')}
      action={
        mayEdit ? (
          <Button
            variant="default"
            size="sm"
            radius="md"
            leftSection={<IconPlus size={14} />}
            onClick={() => setEditing(emptyQuotation(request, today))}
          >
            {t('requests.quotation.add')}
          </Button>
        ) : undefined
      }
    >
      {request.quotations.length === 0 ? (
        <Text size="sm" c="dimmed">
          {fillQuotations ? t('requests.quotation.emptyReady') : t('requests.quotation.emptyWait')}
        </Text>
      ) : (
        <Stack gap="sm">
          {request.quotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              request={request}
              chosen={quotation.id === request.selectedQuotationId}
              isLowest={lowest === quotation.id}
              lowestTotal={lowestTotal}
              expired={isQuotationExpired(quotation, today)}
              mayEdit={mayEdit}
              canChoose={canEdit && selectVendor && quotation.id !== request.selectedQuotationId}
              canRemove={allForms.length > 1}
              busy={save.isPending || select.isPending}
              onEdit={() => setEditing(quotationToForm(quotation))}
              onRemove={() => persist(allForms.filter((form) => form.key !== quotation.id))}
              onChoose={() => select.mutate({ id: request.id, quotationId: quotation.id })}
            />
          ))}
          {request.status === 'VENDOR_SELECTED' && mayEdit && (
            <Text size="xs" c="dimmed">
              {t('requests.quotation.recheckHint')}
            </Text>
          )}
        </Stack>
      )}

      {editing && (
        <QuotationEditorModal
          opened
          request={request}
          initial={editing}
          otherVendorIds={allForms
            .filter((form) => form.key !== editing.key)
            .map((form) => form.vendorId)}
          loading={save.isPending}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </SectionCard>
  );
};
