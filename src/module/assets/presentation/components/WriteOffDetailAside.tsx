import { useState } from 'react';
import { Button, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import {
  IconBook2,
  IconBuildingWarehouse,
  IconCheck,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { WriteOffReport } from '@/module/assets/domain/writeOff';
import { WRITE_OFF_LIMITS } from '@/module/assets/domain/writeOffRules';
import {
  WriteOffApproveModal,
  WriteOffRejectModal,
} from '@/module/assets/presentation/components/WriteOffDecisionModals';
import { WriteOffEvidenceDropzone } from '@/module/assets/presentation/components/WriteOffEvidenceDropzone';
import classes from '@/module/assets/presentation/components/WriteOffForm.module.css';
import { WriteOffTimeline } from '@/module/assets/presentation/components/WriteOffTimeline';
import { useAddWriteOffAttachments } from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { routes } from '@/router/routes';

type Open = 'approve' | 'reject' | 'evidence' | null;

function AddEvidenceModal({
  report,
  onClose,
}: Readonly<{ report: WriteOffReport; onClose: () => void }>) {
  const { t } = useTranslation('assetWriteOffs');
  const add = useAddWriteOffAttachments(report.id);
  const [files, setFiles] = useState<File[]>([]);
  const save = async () => {
    try {
      await add.mutateAsync(files);
      onClose();
    } catch {
      // The mutation shows the failure; the chosen files stay.
    }
  };
  return (
    <Modal opened onClose={onClose} centered radius="lg" size="lg" title={t('addEvidence')}>
      <Stack gap="md">
        <WriteOffEvidenceDropzone
          files={files}
          onChange={setFiles}
          existingCount={report.attachments.length}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" radius="md" onClick={onClose} disabled={add.isPending}>
            {t('cancel')}
          </Button>
          <Button radius="md" disabled={files.length === 0} loading={add.isPending} onClick={save}>
            {t('addEvidence')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/** Beside the document: its journey, the decision when it is the user's, and where to go next. */
export function WriteOffDetailAside({ report }: Readonly<{ report: WriteOffReport }>) {
  const { t } = useTranslation('assetWriteOffs');
  const [open, setOpen] = useState<Open>(null);
  const pending = report.status === 'PENDING_APPROVAL';
  const room = WRITE_OFF_LIMITS.maxFiles - report.attachments.length;
  const assetLink = routes.assets.detail.replace(':id', report.assetId);

  return (
    <Stack gap="md" className={classes.aside}>
      <Paper withBorder radius="lg" p="md" bg="white">
        <WriteOffTimeline report={report} />
      </Paper>

      {report.canDecide && (
        <Paper withBorder radius="lg" p="md" bg="white">
          <Text fw={700} size="md">
            {t('decisionTitle')}
          </Text>
          <Text size="xs" c="dimmed" mb="md">
            {t('decisionBody')}
          </Text>
          <Stack gap="xs">
            <Button
              fullWidth
              radius="md"
              color="teal"
              leftSection={<IconCheck size={16} />}
              onClick={() => setOpen('approve')}
            >
              {t('approve')}
            </Button>
            <Button
              fullWidth
              radius="md"
              variant="default"
              leftSection={<IconX size={16} />}
              onClick={() => setOpen('reject')}
            >
              {t('reject')}
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper withBorder radius="lg" p="md" bg="white">
        <Stack gap="xs">
          {pending && room > 0 && (
            <>
              <Button
                variant="light"
                radius="md"
                leftSection={<IconPaperclip size={16} />}
                onClick={() => setOpen('evidence')}
              >
                {t('addEvidence')}
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                {t('addEvidenceHint', { count: room })}
              </Text>
            </>
          )}
          <Button
            component={Link}
            to={assetLink}
            variant="subtle"
            radius="md"
            leftSection={<IconBuildingWarehouse size={16} />}
          >
            {t('viewAsset')}
          </Button>
          {report.status === 'APPROVED' && (
            <Button
              component={Link}
              to={`${assetLink}?tab=journals`}
              variant="subtle"
              radius="md"
              leftSection={<IconBook2 size={16} />}
            >
              {t('viewJournals')}
            </Button>
          )}
        </Stack>
      </Paper>

      {open === 'approve' && <WriteOffApproveModal report={report} onClose={() => setOpen(null)} />}
      {open === 'reject' && <WriteOffRejectModal report={report} onClose={() => setOpen(null)} />}
      {open === 'evidence' && <AddEvidenceModal report={report} onClose={() => setOpen(null)} />}
    </Stack>
  );
}

export default WriteOffDetailAside;
