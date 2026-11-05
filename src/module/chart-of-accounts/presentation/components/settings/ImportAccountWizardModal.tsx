import React, { useMemo, useState } from 'react';
import { Modal, Stack, Stepper } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountImportParsedData } from '@/module/chart-of-accounts/domain/settingAccount';
import {
  buildImportPreviewRows,
  type ImportFilter,
} from '@/module/chart-of-accounts/domain/importPreview';
import { useAccountSettings } from '../../hooks/useAccountSettings';
import { ImportUploadStep } from './ImportUploadStep';
import { ImportPreviewStep } from './ImportPreviewStep';
import { ImportDoneStep } from './ImportDoneStep';
import { SettingModalHeader } from './SettingModalHeader';

interface ImportAccountWizardModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportAccountWizardModal: React.FC<ImportAccountWizardModalProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('chartOfAccounts');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<AccountImportParsedData | null>(null);
  const [filterType, setFilterType] = useState<ImportFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    downloadTemplate,
    isDownloadingTemplate,
    uploadImport,
    isUploading,
    commitImport,
    isCommitting,
  } = useAccountSettings();

  const handleResetWizard = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setParsedData(null);
    setFilterType('all');
    setSearchQuery('');
  };

  const handleClose = () => {
    handleResetWizard();
    onClose();
  };

  // Step 1: Upload & Parse
  const handleUploadAndValidate = async () => {
    if (!selectedFile) return;
    try {
      const result = await uploadImport(selectedFile);
      setParsedData(result);
      setActiveStep(1);
    } catch {
      // Error handled in hook notification
    }
  };

  // Step 2: Commit correct data
  const handleCommit = async () => {
    if (!parsedData || parsedData.correctData.length === 0) return;
    try {
      await commitImport({ correctData: parsedData.correctData });
      setActiveStep(2);
      onSuccess?.();
    } catch {
      // Error handled in hook notification
    }
  };

  // Filter preview table items
  const correctItems = parsedData?.correctData || [];
  const wrongItems = parsedData?.wrongData || [];

  const combinedItems = useMemo(
    () => buildImportPreviewRows(correctItems, wrongItems, filterType, searchQuery),
    [correctItems, wrongItems, filterType, searchQuery]
  );

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <SettingModalHeader
          tone="import"
          icon={IconUpload}
          title={t('settings.import.title')}
          subtitle={t('settings.import.subtitle')}
        />
      }
      size="xl"
      radius="lg"
      padding="lg"
      centered
    >
      <Stack gap="md" mt="xs">
        <Stepper active={activeStep} allowNextStepsSelect={false} size="sm" mb="xs">
          <Stepper.Step
            label={t('settings.import.step1Label')}
            description={t('settings.import.step1Desc')}
          />
          <Stepper.Step
            label={t('settings.import.step2Label')}
            description={t('settings.import.step2Desc')}
          />
          <Stepper.Step
            label={t('settings.import.step3Label')}
            description={t('settings.import.step3Desc')}
          />
        </Stepper>

        {activeStep === 0 && (
          <ImportUploadStep
            selectedFile={selectedFile}
            onFileChange={setSelectedFile}
            onDownloadTemplate={() => downloadTemplate()}
            isDownloadingTemplate={isDownloadingTemplate}
            onCancel={handleClose}
            onValidate={handleUploadAndValidate}
            isUploading={isUploading}
          />
        )}

        {activeStep === 1 && (
          <ImportPreviewStep
            totalRows={parsedData?.totalData?.length || 0}
            validCount={correctItems.length}
            invalidCount={wrongItems.length}
            rows={combinedItems}
            filter={filterType}
            onFilterChange={setFilterType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isCommitting={isCommitting}
            onBack={() => setActiveStep(0)}
            onCommit={handleCommit}
          />
        )}

        {activeStep === 2 && (
          <ImportDoneStep importedCount={correctItems.length} onClose={handleClose} />
        )}
      </Stack>
    </Modal>
  );
};
