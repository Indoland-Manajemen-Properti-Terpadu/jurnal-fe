import React from 'react';
import { useTranslation } from '@/i18n';
import { SettingDoneView } from './SettingDoneView';

interface ImportDoneStepProps {
  importedCount: number;
  onClose: () => void;
}

/** Step 3 of the import wizard: success screen. */
export const ImportDoneStep: React.FC<ImportDoneStepProps> = ({ importedCount, onClose }) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <SettingDoneView
      title={t('settings.import.doneTitle')}
      description={t('settings.import.doneBody')}
      stat={{ value: importedCount, label: t('settings.import.doneStat') }}
      closeLabel={t('settings.import.doneClose')}
      onClose={onClose}
    />
  );
};
