import { Alert, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AssetAccountField } from '@/module/assets/domain/assetRules';

const FIELD_LABEL: Record<AssetAccountField, string> = {
  assetAccount: 'invalidFieldAsset',
  accumDeprAccount: 'invalidFieldAccumulated',
  deprExpenseAccount: 'invalidFieldExpense',
};

/** Warns that saved accounts are of the wrong kind; offers the account edit when given. */
export function AssetInvalidAccountsAlert({
  fields,
  onFix,
}: Readonly<{ fields: AssetAccountField[]; onFix?: () => void }>) {
  const { t } = useTranslation('assets');
  if (fields.length === 0) return null;
  return (
    <Alert
      color="orange"
      variant="light"
      radius="md"
      icon={<IconAlertTriangle size={18} />}
      title={t('invalidAccountsTitle')}
    >
      {t('invalidAccountsBody', {
        fields: fields.map((field) => t(FIELD_LABEL[field])).join(', '),
      })}
      {onFix && (
        <Button mt="sm" size="xs" variant="default" radius="md" display="block" onClick={onFix}>
          {t('invalidAccountsFix')}
        </Button>
      )}
    </Alert>
  );
}

export default AssetInvalidAccountsAlert;
