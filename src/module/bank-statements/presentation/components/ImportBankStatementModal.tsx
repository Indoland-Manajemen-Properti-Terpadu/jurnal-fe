import { ReactNode, useState } from 'react';
import { Button, Flex, Stack, Stepper, Text } from '@mantine/core';
import { FileCsv, NotePencil, ArrowRight } from '@phosphor-icons/react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { themeColors } from '@/theme';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';
import { useImportBankStatement } from '../hooks/useImportBankStatement';
import { useSimulatedUpload } from '../hooks/useSimulatedUpload';
import ImportStepDownload from './ImportStepDownload';
import ImportStepGuide from './ImportStepGuide';
import ImportStepUpload from './ImportStepUpload';

type ImportBankStatementModalProps = {
  idAccount: string;
  onContinue: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const centered = (icon: ReactNode) => (
  <Flex align="center" justify="center">
    {icon}
  </Flex>
);

const LAST_STEP = 2;

const ImportBankStatementModal: React.FC<ImportBankStatementModalProps> = ({
  idAccount,
  onContinue,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation('bankStatements');
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploading, progress, timeRemaining, start } = useSimulatedUpload();
  const [files, setFiles] = useFileStore((state) => [state.files, state.setFiles]);
  const { mutate: importBankStatement, isPending } = useImportBankStatement(idAccount);

  const handleDrop = (dropped: File[]) => {
    setUploadError(null);
    setFiles(dropped);
    start(dropped[0]);
  };

  const handleReject = () => {
    setUploadError(t('importModal.rejected'));
  };

  const handleNext = () => {
    if (active < LAST_STEP) {
      setActive((prev) => prev + 1);
      return;
    }
    if (files.length === 0) {
      notifications.show({
        color: 'red',
        title: t('importModal.noFileTitle'),
        message: t('importModal.noFileMessage'),
      });
      return;
    }
    importBankStatement(files[0], {
      onSuccess: () => {
        onContinue();
        navigate(routes.generalJournal.bankStatementDraftImport.replace(':idAccount', idAccount));
        setFiles([]);
        setActive(0);
        onClose();
      },
    });
  };

  const handlePreviousStep = () => {
    if (active > 0) {
      setActive((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const stepLabel = (key: string) => (
    <Text fw={600} c={themeColors.black[9]}>
      {t(key)}
    </Text>
  );
  const csvIcon = centered(<FileCsv size={18} weight="bold" />);
  const penIcon = centered(<NotePencil size={18} weight="bold" />);

  return (
    <CustomConfirmModal
      size="55rem"
      opened={isOpen}
      onClose={onClose}
      withCloseButton
      title={
        <Text fw={600} fz={18} c={themeColors.black[9]}>
          {t('importModal.title')}
        </Text>
      }
      labels={{
        confirm: (
          <Button
            color={themeColors.primary[5]}
            onClick={handleNext}
            disabled={uploading || (active === LAST_STEP && files.length === 0)}
            loading={isPending}
            rightSection={<ArrowRight size={18} weight="duotone" />}
          >
            {t('importModal.next')}
          </Button>
        ),
        cancel: (
          <Button
            variant="light"
            color={themeColors.gray[7]}
            onClick={handlePreviousStep}
            disabled={uploading || isPending}
          >
            {t('importModal.cancel')}
          </Button>
        ),
      }}
    >
      <Stack gap="lg" align="stretch" justify="center">
        <Stepper
          active={active}
          onStepClick={!uploading ? setActive : undefined}
          color={themeColors.primary[5]}
          radius="md"
          styles={{ stepIcon: { borderWidth: 2 } }}
        >
          <Stepper.Step
            icon={csvIcon}
            completedIcon={csvIcon}
            progressIcon={csvIcon}
            label={stepLabel('importModal.stepDownload')}
          >
            <ImportStepDownload />
          </Stepper.Step>
          <Stepper.Step
            icon={penIcon}
            completedIcon={penIcon}
            progressIcon={penIcon}
            label={stepLabel('importModal.stepGuide')}
          >
            <ImportStepGuide />
          </Stepper.Step>
          <Stepper.Step
            icon={penIcon}
            completedIcon={penIcon}
            progressIcon={penIcon}
            label={stepLabel('importModal.stepUpload')}
          >
            <ImportStepUpload
              files={files}
              setFiles={setFiles}
              uploading={uploading}
              progress={progress}
              timeRemaining={timeRemaining}
              uploadError={uploadError}
              onDismissError={() => setUploadError(null)}
              onDrop={handleDrop}
              onReject={handleReject}
            />
          </Stepper.Step>
        </Stepper>
      </Stack>
    </CustomConfirmModal>
  );
};

export default ImportBankStatementModal;
