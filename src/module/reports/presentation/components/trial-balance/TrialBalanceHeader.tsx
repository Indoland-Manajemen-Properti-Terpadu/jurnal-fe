import React from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconChevronDown,
  IconDownload,
  IconFileAnalytics,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconPrinter,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { TrialBalanceExportType } from '@/module/reports/domain/trialBalance.types';
import { routes } from '@/router/routes';

interface TrialBalanceHeaderProps {
  hasData: boolean;
  isExporting: boolean;
  onExport: (type: TrialBalanceExportType) => void;
}

export const TrialBalanceHeader: React.FC<TrialBalanceHeaderProps> = ({
  hasData,
  isExporting,
  onExport,
}) => {
  const { t } = useTranslation('reports');

  return (
    <>
      <Button
        component={Link}
        to={routes.reports.main}
        variant="subtle"
        color="gray"
        size="sm"
        leftSection={<IconArrowLeft size={16} />}
        w="fit-content"
      >
        {t('trialBalance.backToReportCenter')}
      </Button>

      <Paper withBorder radius="lg" p="md" bg="white">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
          <Group align="flex-start" wrap="nowrap" gap="md" style={{ minWidth: 0, flex: 1 }}>
            <ThemeIcon size={40} radius="md" color="primary" variant="filled" aria-hidden>
              <IconFileAnalytics size={21} stroke={1.8} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Title order={2} fz="xl" m={0} lh={1.2}>
                {t('catalog.trialBalanceTitle')}
              </Title>
              <Text fz="sm" c="dimmed" mt={4} maw={680}>
                {t('trialBalance.description')}
              </Text>
            </Box>
          </Group>

          <Group gap="sm">
            <Tooltip label={t('trialBalance.printReport')}>
              <ActionIcon
                variant="default"
                size="input-sm"
                radius="md"
                onClick={() => window.print()}
                disabled={!hasData}
                aria-label={t('trialBalance.printReport')}
              >
                <IconPrinter size={17} />
              </ActionIcon>
            </Tooltip>
            <Menu position="bottom-end" shadow="md" width={200} withinPortal>
              <Menu.Target>
                <Button
                  size="sm"
                  variant="default"
                  radius="md"
                  leftSection={<IconDownload size={16} />}
                  rightSection={<IconChevronDown size={14} />}
                  loading={isExporting}
                  disabled={!hasData}
                >
                  {t('common.export')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t('common.chooseExportFormat')}</Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypePdf size={16} />}
                  onClick={() => onExport('pdf')}
                >
                  {t('common.formatPdf')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={() => onExport('xlsx')}
                >
                  {t('common.formatXlsx')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={16} />}
                  onClick={() => onExport('csv')}
                >
                  {t('common.formatCsv')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Paper>
    </>
  );
};
