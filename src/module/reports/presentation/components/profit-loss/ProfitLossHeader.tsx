import React from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconChevronDown,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconPrinter,
  IconTrendingUp,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { ProfitLossExportType } from '@/module/reports/domain/profitLoss.types';
import { routes } from '@/router/routes';

interface ProfitLossHeaderProps {
  hasData: boolean;
  isExporting: boolean;
  onExport: (type: ProfitLossExportType) => void;
  onPrint: () => void;
}

/** Header and page actions for the income statement. */
export const ProfitLossHeader: React.FC<ProfitLossHeaderProps> = ({
  hasData,
  isExporting,
  onExport,
  onPrint,
}) => {
  const { t } = useTranslation('reports');

  return (
    <Stack gap="sm">
      <Button
        component={Link}
        to={routes.reports.main}
        variant="subtle"
        color="gray"
        size="sm"
        leftSection={<IconArrowLeft size={16} />}
        w="fit-content"
      >
        {t('profitLoss.backToReportCenter')}
      </Button>

      <Paper withBorder radius="lg" p="md" bg="white">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
          <Group align="flex-start" wrap="nowrap" gap="md" style={{ minWidth: 0, flex: 1 }}>
            <ThemeIcon size={40} radius="md" color="primary" variant="filled" aria-hidden>
              <IconTrendingUp size={21} stroke={1.8} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Title order={2} fz="xl" m={0} lh={1.2} style={{ margin: 0 }}>
                {t('catalog.incomeStatementTitle')}
              </Title>
              <Text fz="sm" c="dimmed" mt={4} maw={640}>
                {t('profitLoss.description')}
              </Text>
            </Box>
          </Group>

          <Group gap="sm">
            <Tooltip label={t('profitLoss.printIncomeStatement')}>
              <ActionIcon
                variant="default"
                size="input-sm"
                radius="md"
                onClick={onPrint}
                disabled={!hasData}
                aria-label={t('profitLoss.printIncomeStatement')}
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
    </Stack>
  );
};
