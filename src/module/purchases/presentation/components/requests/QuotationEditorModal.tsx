import { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';
import {
  hasQuotationErrors,
  quotationTotal,
  validateQuotation,
  type QuotationFormValues,
} from '@/module/purchases/domain/quotationForm';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';

interface QuotationEditorModalProps {
  opened: boolean;
  request: PurchaseRequest;
  initial: QuotationFormValues;
  /** Vendors that already have another quotation on this request. */
  otherVendorIds: string[];
  loading?: boolean;
  onClose: () => void;
  onSave: (values: QuotationFormValues) => void;
}

const Editor = ({
  request,
  initial,
  otherVendorIds,
  loading,
  onClose,
  onSave,
}: Readonly<Omit<QuotationEditorModalProps, 'opened'>>) => {
  const { t } = useTranslation('purchases');
  const [values, setValues] = useState(initial);
  const [showErrors, setShowErrors] = useState(false);
  const errors = validateQuotation(values, request, otherVendorIds);
  const set = <K extends keyof QuotationFormValues>(key: K, value: QuotationFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const total = quotationTotal(
    request.items.map((item) => item.quantity),
    request.items.map((item) => values.prices[item.id])
  );

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <SupplierSelect
          withAsterisk
          label={t('requests.quotation.vendor')}
          value={values.vendorId || null}
          selected={
            values.vendorId
              ? { id: values.vendorId, name: values.vendorName, paymentTermDays: null, npwp: null }
              : null
          }
          onChange={(id, vendor) =>
            setValues((c) => ({ ...c, vendorId: id ?? '', vendorName: vendor?.name ?? '' }))
          }
          error={
            showErrors && errors.vendor
              ? t('requests.quotation.vendorRequired')
              : showErrors && errors.duplicateVendor
                ? t('requests.quotation.vendorDuplicate')
                : undefined
          }
        />
        <TextInput
          radius="md"
          label={t('requests.quotation.number')}
          value={values.number}
          maxLength={60}
          onChange={(event) => set('number', event.currentTarget.value)}
        />
        <DateField
          withAsterisk
          label={t('requests.quotation.date')}
          value={values.date}
          onChange={(value) => set('date', value)}
          error={showErrors && errors.date ? t('requests.form.dateRequired') : undefined}
        />
        <DateField
          label={t('requests.quotation.validUntil')}
          value={values.validUntil}
          clearable
          minDate={values.date || undefined}
          onChange={(value) => set('validUntil', value)}
          error={
            showErrors && errors.validUntil ? t('requests.quotation.validBeforeDate') : undefined
          }
        />
      </SimpleGrid>

      <Table.ScrollContainer minWidth={420}>
        <Table verticalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              <Table.Th>{t('requests.quotation.item')}</Table.Th>
              <Table.Th ta="right">{t('common.quantity')}</Table.Th>
              <Table.Th w={170}>{t('requests.quotation.unitPrice')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {request.items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  {[item.product?.name, item.description].filter(Boolean).join(' · ')}
                </Table.Td>
                <Table.Td ta="right">
                  {item.quantity} {item.unitName ?? ''}
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    radius="md"
                    aria-label={t('requests.quotation.priceAria', {
                      item: item.product?.name ?? item.description,
                    })}
                    value={values.prices[item.id] ?? ''}
                    min={0}
                    hideControls
                    allowNegative={false}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    onChange={(value) =>
                      setValues((c) => ({
                        ...c,
                        prices: { ...c.prices, [item.id]: value === '' ? '' : Number(value) },
                      }))
                    }
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {showErrors && errors.prices && (
        <Text size="sm" c="red">
          {t('requests.quotation.pricesMissing')}
        </Text>
      )}

      <Textarea
        radius="md"
        label={t('common.memo')}
        value={values.notes}
        minRows={2}
        autosize
        maxLength={300}
        onChange={(event) => set('notes', event.currentTarget.value)}
      />

      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          {t('requests.quotation.total')}{' '}
          <Text span fw={700} c="dark.9">
            {formatAmount(total)}
          </Text>
        </Text>
        <Group gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              if (hasQuotationErrors(errors)) setShowErrors(true);
              else onSave(values);
            }}
          >
            {t('common.save')}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
};

export const QuotationEditorModal = ({ opened, ...rest }: Readonly<QuotationEditorModalProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <Modal
      opened={opened}
      onClose={rest.onClose}
      title={t('requests.quotation.editorTitle')}
      size="lg"
      centered
      radius="lg"
    >
      <Editor key={rest.initial.key} {...rest} />
    </Modal>
  );
};
