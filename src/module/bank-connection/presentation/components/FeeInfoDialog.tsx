import { List, Modal } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { FeeRule } from '@/module/bank-connection/domain/feeRules';

/** The full explanation of how a bank charges: the quota of refreshes, the price beyond it and who takes the payment. */
export function FeeInfoDialog({
  rule,
  opened,
  onClose,
}: Readonly<{ rule: FeeRule; opened: boolean; onClose: () => void }>) {
  const { t } = useTranslation('bankConnection');
  const money = (amount: number) => formatCurrency(amount, false);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('feeInfo.title')}
      centered
      transitionProps={{ duration: 0 }}
    >
      <List spacing="sm" size="sm">
        {rule.autoDebit && <List.Item>{t('feeInfo.autoDebit')}</List.Item>}
        <List.Item>
          {t('feeInfo.quota', { monthly: money(rule.monthly), included: rule.includedRefreshes })}
        </List.Item>
        <List.Item>{t('feeInfo.extra', { extra: money(rule.extraRefreshFee) })}</List.Item>
        {rule.autoRefreshes > 0 && (
          <List.Item>{t('feeInfo.auto', { auto: rule.autoRefreshes })}</List.Item>
        )}
      </List>
    </Modal>
  );
}
