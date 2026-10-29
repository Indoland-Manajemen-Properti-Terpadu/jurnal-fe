import React from 'react';
import { Box, Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconFileInvoice, IconHierarchy2, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CategoryAccountModel } from '@/module/chart-of-accounts/domain/categoryAccount';

interface AddAccountSummaryStripProps {
  selectedCategoryObj?: CategoryAccountModel;
  isIncomeStatementCategory: boolean;
  effectiveDebit: boolean;
  isContra: boolean;
  selectedAccountType: string;
  parentAccountLabel?: string;
  childAccountLabel?: string;
  isFormValid: boolean;
  passedChecksCount: number;
  totalChecks: number;
}

/** Top 4-card configuration summary strip. */
export const AddAccountSummaryStrip: React.FC<AddAccountSummaryStripProps> = ({
  selectedCategoryObj,
  isIncomeStatementCategory,
  effectiveDebit,
  isContra,
  selectedAccountType,
  parentAccountLabel,
  childAccountLabel,
  isFormValid,
  passedChecksCount,
  totalChecks,
}) => {
  const { t } = useTranslation('journal');

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {/* Card 1: Classification & Financial Report Target */}
      <Paper withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('stripCategoryLabel')}
            </Text>
            <Text fz={17} fw={800} c="dark.8" mt={4} lh={1.2} truncate>
              {selectedCategoryObj?.name || t('stripCategoryUnselected')}
            </Text>
            <Text size="xs" c="dimmed" mt={4} truncate>
              {selectedCategoryObj
                ? isIncomeStatementCategory
                  ? t('stripReportIncomeStatement')
                  : t('stripReportBalanceSheet')
                : 'Pilih kategori di bawah'}
            </Text>
          </Box>
          <ThemeIcon size={40} radius="md" variant="light" color="primary">
            <IconFileInvoice size={20} />
          </ThemeIcon>
        </Group>
      </Paper>

      {/* Card 2: Effective Normal Balance Side */}
      <Paper withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('stripNormalBalanceLabel')}
            </Text>
            <Text fz={17} fw={800} c={effectiveDebit ? 'teal.8' : 'red.8'} mt={4} lh={1.2} truncate>
              {effectiveDebit ? t('stripDebitNormal') : t('stripCreditNormal')}
            </Text>
            <Text
              size="xs"
              c={isContra ? 'orange.7' : 'dimmed'}
              fw={isContra ? 600 : 400}
              mt={4}
              truncate
            >
              {isContra ? t('stripContraActive') : t('stripStandardMode')}
            </Text>
          </Box>
          <ThemeIcon size={40} radius="md" variant="light" color={effectiveDebit ? 'teal' : 'red'}>
            <IconScale size={20} />
          </ThemeIcon>
        </Group>
      </Paper>

      {/* Card 3: Hierarchy Position */}
      <Paper withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('stripHierarchyLabel')}
            </Text>
            <Text fz={17} fw={800} c="dark.8" mt={4} lh={1.2} truncate>
              {selectedAccountType === 'SubAccount'
                ? t('typeSubTitle')
                : selectedAccountType === 'HeaderAccount'
                  ? t('typeHeaderTitle')
                  : t('typeSingleTitle')}
            </Text>
            <Text size="xs" c="dimmed" mt={4} truncate>
              {selectedAccountType === 'SubAccount'
                ? parentAccountLabel || 'Pilih akun induk...'
                : selectedAccountType === 'HeaderAccount'
                  ? childAccountLabel || 'Payung konsolidasi'
                  : 'Berdiri mandiri'}
            </Text>
          </Box>
          <ThemeIcon size={40} radius="md" variant="light" color="teal">
            <IconHierarchy2 size={20} />
          </ThemeIcon>
        </Group>
      </Paper>

      {/* Card 4: Configuration Readiness */}
      <Paper withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('stripReadinessLabel')}
            </Text>
            <Text fz={17} fw={800} c={isFormValid ? 'teal.7' : 'dark.8'} mt={4} lh={1.2} truncate>
              {t('stripReadinessValue', {
                passed: passedChecksCount,
                total: totalChecks,
              })}
            </Text>
            <Text size="xs" c={isFormValid ? 'teal.7' : 'dimmed'} fw={600} mt={4} truncate>
              {isFormValid ? t('stripReadinessReady') : t('stripReadinessPending')}
            </Text>
          </Box>
          <ThemeIcon size={40} radius="md" variant="light" color={isFormValid ? 'teal' : 'gray'}>
            <IconCheck size={20} />
          </ThemeIcon>
        </Group>
      </Paper>
    </SimpleGrid>
  );
};
