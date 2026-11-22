import { useState } from 'react';
import { useTranslation } from '@/i18n';
import {
  SourcePickerDialog,
  type SourceOption,
} from '@/module/purchases/presentation/components/shared/SourcePickerDialog';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { useBills } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface BillPickerDialogProps {
  opened: boolean;
  onClose: () => void;
  onPick: (billId: string) => void;
}

/** The verified bill a return takes goods back against. */
export const BillPickerDialog = ({ opened, onClose, onPick }: Readonly<BillPickerDialogProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const query = useBills(
    { status: ['VERIFIED', 'PARTIAL_PAID', 'PAID'], search, limit: 20 },
    opened
  );
  const options: SourceOption[] = (query.data?.items ?? []).map((bill) => ({
    id: bill.id,
    number: bill.number,
    line: bill.vendor.name,
    sub: bill.purchaseOrderRefs.map((ref) => ref.number).join(', ') || bill.vendorInvoiceNumber,
    trailing: formatAmount(bill.finalAmount),
  }));

  return (
    <SourcePickerDialog
      opened={opened}
      onClose={onClose}
      title={t('returns.picker.title')}
      description={t('returns.picker.description')}
      searchPlaceholder={t('returns.picker.search')}
      emptyText={t('returns.picker.empty')}
      options={options}
      isLoading={query.isLoading}
      isError={query.isError}
      onSearch={setSearch}
      onPick={onPick}
    />
  );
};
