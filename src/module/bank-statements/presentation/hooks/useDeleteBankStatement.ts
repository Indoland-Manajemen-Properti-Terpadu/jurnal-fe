import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { deleteBankStatement, errorMessage } from '../../infrastructure/bankStatementApi';

const tr = (key: string) => t(key, undefined, 'bankStatements');

/** Deletes one imported row and refreshes the lists that show it. */
export const useDeleteBankStatement = (idAccount: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBankStatement(id),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: tr('toast.deleteOkTitle'),
        message: tr('toast.deleteOkMessage'),
      });
      queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] });
      queryClient.invalidateQueries({ queryKey: ['get_reconciliation'] });
    },
    onError: (error: unknown) => {
      const reconciled = errorMessage(error, '').includes('already been reconciled');
      notifications.show({
        color: 'red',
        title: tr('toast.deleteFailTitle'),
        message: tr(reconciled ? 'toast.deleteReconciled' : 'toast.deleteFailMessage'),
      });
    },
  });
};
