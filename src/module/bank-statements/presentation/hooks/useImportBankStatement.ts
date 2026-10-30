import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { t } from '@/i18n';
import { routes } from '@/router/routes';
import {
  commitBankStatementImport,
  confirmBankStatementImport,
  errorMessage,
  hasResponse,
  bodyMessage,
  uploadBankStatement,
} from '../../infrastructure/bankStatementApi';
import { saveImportDraft } from '../../infrastructure/importDraftStorage';
import type { ConfirmImportPayload } from '../../domain/importDraft';

const tr = (key: string, params?: Record<string, string | number>) =>
  t(key, params, 'bankStatements');

const accountPath = (idAccount: string) =>
  routes.generalJournal.detailAccount.replace(':idAccount', idAccount);

export const useImportBankStatement = (idAccount: string) =>
  useMutation({
    mutationFn: (file: File) => uploadBankStatement(idAccount, file),
    onSuccess: (body) => saveImportDraft(body),
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        title: tr('toast.uploadFailedTitle'),
        message: errorMessage(error, tr('toast.uploadFailedMessage')),
      });
    },
  });

export const useConfirmImportBankStatement = (idAccount: string) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: ConfirmImportPayload) => confirmBankStatementImport(payload),
    onSuccess: (resp) => {
      if (resp?.status === 400 || resp?.code === 400) {
        notifications.show({
          color: 'red',
          title: tr('toast.confirmFailedTitle'),
          message: resp.message || bodyMessage(resp.data) || tr('toast.confirmFailedFallback'),
        });
        return;
      }
      notifications.show({
        color: 'green',
        title: tr('toast.confirmSuccessTitle'),
        message: tr('toast.confirmSuccessMessage'),
      });
      navigate(accountPath(idAccount));
    },
    onError: (error: unknown) => {
      const rejected = hasResponse(error);
      notifications.show({
        color: 'red',
        title: tr(rejected ? 'toast.confirmFailedTitle' : 'toast.serverErrorTitle'),
        message: rejected
          ? errorMessage(error, tr('toast.confirmFailedFallback'))
          : tr('toast.serverErrorMessage'),
      });
    },
  });
};

/** Not used by a page today; kept with its endpoint gap documented in the README. */
export const useSubmitImportBankStatement = (idAccount: string) => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => commitBankStatementImport(idAccount, data),
    onSuccess: (resp) => {
      if (resp?.status === 400) {
        notifications.show({
          color: 'red',
          title: tr('toast.commitFailedTitle'),
          message: resp.message,
        });
        return;
      }
      notifications.show({
        color: 'green',
        title: tr('toast.commitSuccessTitle'),
        message: tr('toast.commitSuccessMessage'),
      });
      navigate(accountPath(idAccount));
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: tr('toast.commitErrorTitle'),
        message: tr('toast.commitErrorMessage'),
      });
      navigate(accountPath(idAccount));
    },
  });
};
