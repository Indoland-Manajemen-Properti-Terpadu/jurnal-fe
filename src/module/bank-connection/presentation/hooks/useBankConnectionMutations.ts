import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BankConnection } from '@/module/bank-connection/domain/connection';
import {
  DOCUMENT_TYPES,
  type DocumentFiles,
} from '@/module/bank-connection/domain/connectionDocuments';
import type { ConnectionBody, DraftBody } from '@/module/bank-connection/domain/connectionForm';
import {
  cancelConnection,
  createConnection,
  proposeBank,
  revokeConnection,
  signConnection,
  uploadDocument,
  submitConnection,
  syncConnection,
  updateConnection,
} from '@/module/bank-connection/infrastructure/bankConnectionApi';
import type { BankConnectionError } from '@/module/bank-connection/infrastructure/bankConnectionErrors';
import { bankConnectionKeys } from '@/module/bank-connection/presentation/hooks/bankConnectionKeys';
import { useConnectionScope } from '@/module/bank-connection/presentation/hooks/useConnectionScope';

/** After any change the connection data and the account list (which carries the status) are stale. */
const useRefresh = () => {
  const queryClient = useQueryClient();
  const scope = useConnectionScope();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: bankConnectionKeys.all(scope) }),
      queryClient.invalidateQueries({ queryKey: ['accounts'] }),
    ]);
};

export interface SaveConnectionInput {
  /** Set when editing a draft or a request sent back; absent for a new one. */
  id?: string;
  body: ConnectionBody | DraftBody;
  /** Send for review right after saving. */
  submit: boolean;
  /** Documents chosen in the form, uploaded to the saved request before it is sent. */
  documents?: DocumentFiles;
}

/** A failed step after the request was saved: its id lets the next try update it instead of creating another. */
export type SaveError = BankConnectionError & { savedId?: string };

/** Saves the form as a draft (create or update) and, when asked, sends it for review. */
export const useSaveConnection = () => {
  const refresh = useRefresh();
  return useMutation<BankConnection, SaveError, SaveConnectionInput>({
    mutationFn: async ({ id, body, submit, documents = {} }) => {
      const saved = id ? await updateConnection(id, body) : await createConnection(body);
      try {
        for (const type of DOCUMENT_TYPES) {
          const file = documents[type];
          if (file) await uploadDocument(saved.id, type, file);
        }
        return submit ? await submitConnection(saved.id) : saved;
      } catch (error) {
        throw Object.assign(error as BankConnectionError, { savedId: saved.id });
      }
    },
    onSuccess: () => refresh(),
  });
};

const useAction = <Input>(call: (input: Input) => Promise<unknown>) => {
  const refresh = useRefresh();
  return useMutation<unknown, BankConnectionError, Input>({
    mutationFn: call,
    onSuccess: () => refresh(),
  });
};

export const useSignConnection = () => useAction((id: string) => signConnection(id));
export const useCancelConnection = () => useAction((id: string) => cancelConnection(id));
export const useRevokeConnection = () =>
  useAction((input: { id: string; reason?: string }) => revokeConnection(input.id, input.reason));
export const useSyncConnection = () => useAction((id: string) => syncConnection(id));

/** Proposing a bank changes nothing that is cached, so it needs no refresh. */
export const useProposeBank = () =>
  useMutation<void, BankConnectionError, { bankCode: string; note?: string }>({
    mutationFn: proposeBank,
  });
