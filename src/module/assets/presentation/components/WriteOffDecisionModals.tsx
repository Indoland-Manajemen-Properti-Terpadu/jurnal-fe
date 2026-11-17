import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { WriteOffReport } from '@/module/assets/domain/writeOff';
import { WRITE_OFF_LIMITS } from '@/module/assets/domain/writeOffRules';
import { AssetModalTitle } from '@/module/assets/presentation/components/AssetModalTitle';
import { SignaturePad } from '@/module/assets/presentation/components/SignaturePad';
import {
  useApproveWriteOff,
  useRejectWriteOff,
  writeOffErrorMessage,
} from '@/module/assets/presentation/hooks/useWriteOffQueries';

type ModalProps = { report: WriteOffReport; onClose: () => void };

/** Approving signs the report and posts the disposal journal; a failure leaves it waiting. */
export function WriteOffApproveModal({ report, onClose }: Readonly<ModalProps>) {
  const { t } = useTranslation('assetWriteOffs');
  const approve = useApproveWriteOff(report.id);
  const [signature, setSignature] = useState<Blob | null>(null);
  const [note, setNote] = useState('');
  const [signatureError, setSignatureError] = useState<string | undefined>();
  const [failure, setFailure] = useState<string | null>(null);

  const submit = async () => {
    if (!signature) {
      setSignatureError(t('errSignatureRequired'));
      return;
    }
    setFailure(null);
    try {
      await approve.mutateAsync({ signature, note });
      onClose();
    } catch (error) {
      setFailure(writeOffErrorMessage(error));
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      centered
      radius="lg"
      size="lg"
      padding="lg"
      title={
        <AssetModalTitle icon={IconCheck} title={t('approveTitle')} subtitle={report.number} />
      }
    >
      <Stack gap="md">
        <Alert color="primary" variant="light" radius="md">
          <Text size="sm">{t('approveConsequence')}</Text>
        </Alert>
        {failure && (
          <Alert
            color="red"
            variant="light"
            radius="md"
            icon={<IconAlertCircle size={18} />}
            title={t('approveFailedTitle')}
          >
            <Text size="sm">{failure}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              {t('approveFailedHint')}
            </Text>
          </Alert>
        )}
        <SignaturePad
          value={signature}
          onChange={(next) => {
            setSignature(next);
            setSignatureError(undefined);
          }}
          label={t('signatureLabel')}
          error={signatureError}
        />
        <Textarea
          label={t('approveNoteLabel')}
          autosize
          minRows={2}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" radius="md" onClick={onClose} disabled={approve.isPending}>
            {t('cancel')}
          </Button>
          <Button radius="md" color="teal" loading={approve.isPending} onClick={submit}>
            {t('approveSubmit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/** Rejecting needs a reason the submitter will read; nothing is posted. */
export function WriteOffRejectModal({ report, onClose }: Readonly<ModalProps>) {
  const { t } = useTranslation('assetWriteOffs');
  const reject = useRejectWriteOff(report.id);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [failure, setFailure] = useState<string | null>(null);

  const submit = async () => {
    if (reason.trim().length < WRITE_OFF_LIMITS.rejectReasonMin) {
      setError(t('errReasonShort'));
      return;
    }
    setFailure(null);
    try {
      await reject.mutateAsync(reason);
      onClose();
    } catch (cause) {
      setFailure(writeOffErrorMessage(cause));
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      centered
      radius="lg"
      padding="lg"
      title={<AssetModalTitle icon={IconX} title={t('rejectTitle')} subtitle={report.number} />}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('rejectBody')}
        </Text>
        {failure && (
          <Alert color="red" variant="light" radius="md" icon={<IconAlertCircle size={18} />}>
            {failure}
          </Alert>
        )}
        <Textarea
          label={t('rejectReasonLabel')}
          placeholder={t('rejectReasonPlaceholder')}
          withAsterisk
          autosize
          minRows={3}
          data-autofocus
          value={reason}
          onChange={(event) => {
            setReason(event.currentTarget.value);
            setError(undefined);
          }}
          error={error}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" radius="md" onClick={onClose} disabled={reject.isPending}>
            {t('cancel')}
          </Button>
          <Button radius="md" color="red" loading={reject.isPending} onClick={submit}>
            {t('rejectSubmit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
