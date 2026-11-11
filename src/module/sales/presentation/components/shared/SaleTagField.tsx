import { TagSelect } from '@/components/TagSelect/TagSelect';
import { useTranslation } from '@/i18n';
import { useCreateSaleTag } from '../../hooks/useSaleMutations';
import { useSaleTagOptions } from '../../hooks/useSaleQueries';

type SaleTagFieldProps = {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
};

/** Tags of an invoice or a payment: pick existing ones or add a new one in place. */
export function SaleTagField({ label, placeholder, value, onChange }: Readonly<SaleTagFieldProps>) {
  const { t } = useTranslation('sales');
  const tagsQuery = useSaleTagOptions();
  const createTag = useCreateSaleTag();

  return (
    <TagSelect
      label={label}
      placeholder={placeholder}
      emptyText={t('tags.empty')}
      addPlaceholder={t('tags.addPlaceholder')}
      addLabel={t('tags.add')}
      options={(tagsQuery.data ?? []).map((tag) => ({ value: tag.id, label: tag.name }))}
      value={value}
      onChange={onChange}
      isLoading={tagsQuery.isLoading}
      isCreating={createTag.isPending}
      onCreate={(name) => createTag.mutateAsync(name).catch(() => null)}
    />
  );
}

export default SaleTagField;
