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
  IconBook2,
  IconChevronDown,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconPrinter,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { GeneralLedgerExportType } from '@/module/reports/domain/generalLedger.types';
import { routes } from '@/router/routes';
import classes from './GeneralLedger.module.css';

interface Props {
  hasData: boolean;
  isExporting: boolean;
  onExport: (type: GeneralLedgerExportType) => void;
  onPrint: () => void;
}

export function GeneralLedgerHeader({ hasData, isExporting, onExport, onPrint }: Props) {
  const { t } = useTranslation('reports');
  return (
    <Stack gap="sm" className={classes.screenOnly}>
      <Button
        component={Link}
        to={routes.reports.main}
        variant="subtle"
        color="gray"
        size="sm"
        leftSection={<IconArrowLeft size={16} />}
        w="fit-content"
      >
        {t('common.backToReports')}
      </Button>
      <Paper withBorder radius="lg" p="md" bg="white">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
          <Group align="flex-start" wrap="nowrap" gap="md" style={{ minWidth: 0, flex: 1 }}>
            <ThemeIcon size={40} radius="md" color="primary" variant="filled" aria-hidden>
              <IconBook2 size={21} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Title order={2} fz="xl" m={0}>
                {t('generalLedger.pageTitle')}
              </Title>
              <Text fz="sm" c="dimmed" mt={4} maw={640}>
                {t('generalLedger.pageDescription')}
              </Text>
            </Box>
          </Group>
          <Group gap="sm">
            <Tooltip label={t('generalLedger.printLedger')}>
              <ActionIcon
                variant="default"
                size="input-sm"
                radius="md"
                onClick={onPrint}
                disabled={!hasData}
                aria-label={t('generalLedger.printLedger')}
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
}
