import React from 'react';
import { Button, Menu } from '@mantine/core';
import { IconFileExport } from '@tabler/icons-react';

import { useTranslation } from '@/i18n';
interface ExportMenuProps {
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  onExportXLSX?: () => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExportPDF, onExportCSV, onExportXLSX }) => {
  const { t } = useTranslation('reports');
  return (
    <Menu position="bottom-end">
      <Menu.Target>
        <Button leftSection={<IconFileExport size={14} />} variant="default" size="xs">
          {t('common.exportEn')}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={onExportPDF}>{t('common.exportToPdf')}</Menu.Item>
        <Menu.Item onClick={onExportCSV}>{t('common.exportToCsv')}</Menu.Item>
        <Menu.Item onClick={onExportXLSX}>{t('common.exportToXlsx')}</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ExportMenu;
