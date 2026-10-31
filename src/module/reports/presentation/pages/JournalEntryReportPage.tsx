import React, { useState, useEffect, useMemo } from 'react';
import { Container, Grid, Paper, Stack, Title, Text, Select, Button, Flex } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconChevronDown, IconFileExport, IconTimeline } from '@tabler/icons-react';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useJournalEntryReport } from '@/module/reports/presentation/hooks/useJournalEntryReport';
import { getDateRange } from '@/utils/DateRange';
import { dateFormatTimeZone } from '@/utils/FormatDate';
import JournalEntryTable from '@/module/reports/presentation/components/journal-entry/JournalEntryTable';
import AppShellLayout from '@/components/AppShellLayout';
import { ReportJournalEntryModel } from '@/module/reports/domain/JournalEntry.types';
import { dateTimeNow } from '@/utils/DateTimeNow';
import { getTime } from 'date-fns';
import { formatCurrency } from '@/utils/FormatCurrency';

import { useTranslation } from '@/i18n';
import { usePeriodOptions } from '@/module/reports/presentation/hooks/usePeriodOptions';
// Dayjs Plugins
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

const JournalEntryReportPage: React.FC = () => {
  const { t } = useTranslation('reports');
  const periodOptions = usePeriodOptions();
  // State Management
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All Period');
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);

  const { data: journalEntries, isLoading } = useJournalEntryReport();

  // Updates the date range based on the selected period
  useEffect(() => {
    if (!isCustomDate) {
      if (selectedPeriod === 'All Period' && journalEntries?.length) {
        const oldestDate = getOldestDate(journalEntries);
        setStartDate(dayjs(oldestDate).format('YYYY-MM-DD'));
        setEndDate(dayjs().format('YYYY-MM-DD'));
      } else if (selectedPeriod !== 'Custom') {
        const { startDate: rangeStart, endDate: rangeEnd } = getDateRange(selectedPeriod);
        setStartDate(rangeStart);
        setEndDate(rangeEnd);
      }
    }
  }, [selectedPeriod, journalEntries, isCustomDate]);

  // Filter journal entries based on date range
  const filteredJournalEntries = useMemo(() => {
    if (!startDate && !endDate) return journalEntries;

    return journalEntries?.filter((entry) =>
      isEntryWithinDateRange(dayjs(entry.transactionDate).format('YYYY-MM-DD'), startDate, endDate)
    );
  }, [journalEntries, startDate, endDate]);

  // Get the latest journal entry date
  const noDataLabel = t('common.noDataAvailable');
  const latestEntryDate = useMemo(
    () => getLatestDate(journalEntries || [], noDataLabel),
    [journalEntries, noDataLabel]
  );

  // Handles custom date changes
  const handleDateChange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedPeriod('Custom');
    setIsCustomDate(true);
  };

  // Export the report to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumns = [
      t('journalEntry.colNumber'),
      t('journalEntry.colDate'),
      t('common.account'),
      t('common.debit'),
      t('common.credit'),
    ];
    const { tableRows, totalDebit, totalCredit } = generateTableData(filteredJournalEntries || []);

    addReportHeader(doc, t('journalEntry.reportTitle'), selectedPeriod, startDate, endDate);
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 32,
      theme: 'grid',
    });

    addTotalsToPDF(doc, totalDebit, totalCredit);

    const fileName = `JournalEntry_${startDate || 'All'}_${endDate || 'All'}.pdf`;
    doc.save(fileName);
  };

  return (
    <AppShellLayout>
      <Container fluid>
        <Stack gap="lg">
          <ReportPageHeader
            icon={IconTimeline}
            title={t('catalog.journalTitle')}
            description={t('journalEntry.description')}
          />
          <Paper {...PAPER_PROPS}>
            <Stack gap={1}>
              <Text c="gray" fz={14}>
                {t('journalEntry.lastTransaction')} {dateFormatTimeZone(latestEntryDate)}
              </Text>
            </Stack>
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack>
              <Flex gap="xs" justify="space-between" align="center">
                <Grid columns={24} gutter="sm" style={{ flexGrow: 1 }}>
                  <Grid.Col span={6}>
                    <DatePickerInput
                      placeholder="Start Date Period"
                      valueFormat="DD/MM/YYYY"
                      highlightToday
                      size="xs"
                      value={startDate ? dayjs(startDate).toDate() : null}
                      onChange={(value) =>
                        handleDateChange(value ? dayjs(value).format('YYYY-MM-DD') : null, endDate)
                      }
                      clearable={!!startDate}
                      rightSection={!startDate ? <IconCalendar size={16} /> : null}
                      maxDate={dayjs().toDate()}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DatePickerInput
                      placeholder="End Date Period"
                      valueFormat="DD/MM/YYYY"
                      highlightToday
                      size="xs"
                      value={endDate ? dayjs(endDate).toDate() : null}
                      onChange={(value) =>
                        handleDateChange(
                          startDate,
                          value ? dayjs(value).format('YYYY-MM-DD') : null
                        )
                      }
                      clearable={!!endDate}
                      rightSection={!endDate ? <IconCalendar size={16} /> : null}
                      maxDate={dayjs().toDate()}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      data={periodOptions}
                      value={selectedPeriod}
                      onChange={(value) => {
                        setSelectedPeriod(value || 'All Period');
                        setIsCustomDate(false);
                      }}
                      placeholder="Select Period"
                      size="xs"
                      rightSection={<IconChevronDown size={16} />}
                    />
                  </Grid.Col>
                </Grid>

                <Button
                  leftSection={<IconFileExport size={14} />}
                  variant="default"
                  size="xs"
                  style={{ marginLeft: 'auto' }}
                  onClick={exportToPDF}
                >
                  {t('common.exportEn')}
                </Button>
              </Flex>

              <JournalEntryTable
                data={filteredJournalEntries}
                isLoading={isLoading}
                period={selectedPeriod}
                startDate={startDate || ''}
                endDate={endDate || ''}
              />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

// Helper Functions
const getOldestDate = (entries: any[]) =>
  new Date(Math.min(...entries.map((entry) => new Date(entry.transactionDate).getTime())));

const getLatestDate = (entries: any[], noDataLabel: string) => {
  if (!entries.length) return noDataLabel;
  const latestDate = Math.max(...entries.map((entry) => new Date(entry.transactionDate).getTime()));
  return new Date(latestDate);
};

const isEntryWithinDateRange = (date: string, start: string | null, end: string | null) => {
  const transactionDate = dayjs(date).utc();
  const startDate = start ? dayjs(start).utc().startOf('day') : null;
  const endDate = end ? dayjs(end).utc().endOf('day') : null;

  return (
    (!startDate || transactionDate.isSameOrAfter(startDate)) &&
    (!endDate || transactionDate.isSameOrBefore(endDate))
  );
};

const generateTableData = (entries: ReportJournalEntryModel[]) => {
  const tableRows: any[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  entries.forEach((entry) => {
    entry.transactionDetail.forEach((txn) => {
      tableRows.push([
        `Journal Entry #${entry.transactionNumber}`,
        dayjs(entry.transactionDate).format('DD/MM/YYYY'),
        `${txn.account?.name || '-'} (${txn.account?.accountNumber || 'N/A'})`,
        formatCurrency(txn.debit || 0),
        formatCurrency(txn.credit || 0),
      ]);
      totalDebit += txn.debit || 0;
      totalCredit += txn.credit || 0;
    });
  });

  return { tableRows, totalDebit, totalCredit };
};

const addReportHeader = (
  doc: jsPDF,
  title: string,
  period: string,
  start: string | null,
  end: string | null
) => {
  doc.text(title, 14, 10);
  doc.setFontSize(12);
  doc.text(`Period: ${period}`, 14, 18);
  if (start && end) {
    doc.text(`Date Range: ${start} - ${end}`, 14, 26);
  }
};

const addTotalsToPDF = (doc: jsPDF, totalDebit: number, totalCredit: number) => {
  const finalY = (doc as any).lastAutoTable.finalY || 32;
  doc.text(`Total Debit: ${totalDebit}`, 14, finalY + 10);
  doc.text(`Total Credit: ${totalCredit}`, 14, finalY + 18);
};

export default JournalEntryReportPage;
