import { themeColors } from '@/theme';
import { Button, Stack, Text, Input, Group, Paper, Badge } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { useState, useEffect } from 'react';
import { DataTable } from 'mantine-datatable';
import { formatCurrency } from '@/utils/FormatCurrency';
import { DatePickerInput } from '@mantine/dates';
import { useParams } from 'react-router-dom';
import { dateFormatV1 } from '@/utils/FormatDate';
import { BankStatementData } from '../types/GetReconciliationModel';
import uploadTemplateImage from '@/assets/img/vectors/rekon.svg';

import {
  ArrowCircleDown,
  ArrowCircleUp,
  MagnifyingGlass,
  PuzzlePieceIcon,
} from '@phosphor-icons/react';
import useFilterTransaction from '../../Main/store/FilterTransaction';
import { useGetJournalDetailsForRecon } from '../services/GetJournalDetailsForRecon.service';

interface FindAndReconModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (journals: any[]) => void;
  SelectedBankStatament: BankStatementData | null;
}

export const FindAndReconModal: React.FC<FindAndReconModalProps> = ({
  opened,
  onClose,
  onConfirm,
  SelectedBankStatament,
}) => {
  const { idAccount } = useParams<{ idAccount: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: journalDetails = [], isLoading } = useGetJournalDetailsForRecon(
    SelectedBankStatament?.id || null
  );
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  console.log('Journal Details Data:', { journalDetails, isLoading, count: journalDetails.length });

  // Reset selected records when modal opens/closes or bank statement changes
  useEffect(() => {
    setSelectedRecords([]);
    setSearchQuery('');
    setSelectedDate(null);
  }, [SelectedBankStatament?.id, opened]);

  const filteredTransaction = journalDetails?.filter((item: any) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.account?.name && item.account.name.toLowerCase().includes(query)) ||
      (item.account?.accountNumber && item.account.accountNumber.toLowerCase().includes(query)) ||
      (item.transactionDate && dateFormatV1(item.transactionDate).toLowerCase().includes(query));

    let matchesDate = true;
    if (selectedDate && item.transactionDate) {
      const itemDate = new Date(item.transactionDate);
      const filterDate = new Date(selectedDate);
      matchesDate = itemDate.toDateString() === filterDate.toDateString();
    }

    // Match debit with debit and credit with credit
    let matchesType = true;
    const bankAmount = SelectedBankStatament?.amount || 0;
    if (bankAmount > 0) {
      // Bank statement Diterima (positive) → match dengan journal debit (uang masuk)
      matchesType = item.debit > 0;
    } else if (bankAmount < 0) {
      // Bank statement Dikirim (negative) → match dengan journal credit (uang keluar)
      matchesType = item.credit > 0;
    }

    return matchesQuery && matchesDate && matchesType;
  });

  console.log('Filtered Transaction:', {
    journalDetailsCount: journalDetails?.length,
    filteredCount: filteredTransaction?.length,
    journalDetails,
    filteredTransaction,
  });

  const totalNominal = Math.abs(SelectedBankStatament?.amount || 0);
  const selectedNominal = selectedRecords.reduce((total, record) => {
    return total + (record.debit || record.credit || 0);
  }, 0);
  const shortageNominal = totalNominal - selectedNominal;
  const excessNominal = selectedNominal - totalNominal;

  const columns = [
    {
      accessor: 'description',
      title: (
        <Text size="sm" fw={600} c={themeColors.black[9]}>
          Deskripsi
        </Text>
      ),
      render: (element: any) => (
        <Text
          size="sm"
          c={themeColors.teal[6]}
          fw={500}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          {element.description || '-'}
        </Text>
      ),
    },
    {
      accessor: 'transactionDate',
      title: (
        <Text size="sm" fw={600} c={themeColors.black[9]}>
          Tanggal
        </Text>
      ),
      render: (element: any) => (
        <Text size="sm" c={themeColors.black[9]}>
          {element.transactionDate ? dateFormatV1(element.transactionDate) : '-'}
        </Text>
      ),
    },
    {
      accessor: 'debit',
      title: (
        <Text size="sm" fw={600} c={themeColors.black[9]}>
          Debit (Dalam Rp)
        </Text>
      ),
      render: (element: any) => (
        <Text size="sm" c={themeColors.black[9]}>
          {formatCurrency(element.debit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'credit',
      title: (
        <Text size="sm" fw={600} c={themeColors.black[9]}>
          Kredit (Dalam Rp)
        </Text>
      ),
      render: (element: any) => (
        <Text size="sm" c={themeColors.black[9]}>
          {formatCurrency(element.credit || 0)}
        </Text>
      ),
    },
  ];

  const handleConfirm = () => {
    if (selectedRecords.length > 0 && selectedNominal === totalNominal) {
      setShowConfirmation(true);
    }
  };

  const handleActualConfirm = () => {
    onConfirm(selectedRecords);
    setShowConfirmation(false);
    onClose();
  };

  return (
    <>
      <CustomConfirmModal
        size="65rem"
        opened={opened}
        onClose={onClose}
        withCloseButton={true}
        title={
          <Text fw={700} fz={18} c={themeColors.black[9]}>
            Cocokkan dengan Rekening Koran
          </Text>
        }
        labels={{
          confirm: (
            <Button
              variant="filled"
              bg={
                selectedNominal === totalNominal && selectedRecords.length > 0
                  ? themeColors.teal[5]
                  : themeColors.gray[2]
              }
              onClick={handleConfirm}
              leftSection={<PuzzlePieceIcon size={16} weight="duotone" />}
              disabled={selectedRecords.length === 0 || selectedNominal !== totalNominal}
              style={{
                color:
                  selectedNominal === totalNominal && selectedRecords.length > 0
                    ? 'white'
                    : themeColors.gray[5],
              }}
            >
              <Group gap={6}>
                Rekonsiliasi
                {selectedRecords.length > 0 && (
                  <Badge color={themeColors.teal[8]} variant="filled" size="sm">
                    {selectedRecords.length}
                  </Badge>
                )}
              </Group>
            </Button>
          ),
          cancel: (
            <Button
              variant="filled"
              bg={themeColors.blue[0]}
              c={themeColors.blue[6]}
              onClick={onClose}
            >
              Batal
            </Button>
          ),
        }}
      >
        <Stack gap="md">
          {/* Bank Statement Summary Card */}
          {SelectedBankStatament && (
            <Paper withBorder p="md" radius="sm" bg="white">
              <Stack gap="xs">
                <Text size="xs" fw={600} c={themeColors.black[9]}>
                  Rekening Koran
                </Text>
                <Group justify="space-between" align="flex-start">
                  <Stack gap={2}>
                    <Text size="xs" c={themeColors.gray[6]}>
                      {dateFormatV1(SelectedBankStatament.date)}
                    </Text>
                    <Text size="sm" fw={600} c={themeColors.black[9]}>
                      {SelectedBankStatament.description}
                    </Text>
                  </Stack>
                  <Stack align="flex-end" gap={4}>
                    <Badge
                      variant="light"
                      color={SelectedBankStatament.amount > 0 ? 'green' : 'red'}
                      leftSection={
                        SelectedBankStatament.amount > 0 ? (
                          <ArrowCircleDown size={14} />
                        ) : (
                          <ArrowCircleUp size={14} />
                        )
                      }
                    >
                      <Text
                        size="xs"
                        fw={700}
                        c={
                          SelectedBankStatament.amount > 0
                            ? themeColors.green[8]
                            : themeColors.red[8]
                        }
                      >
                        {SelectedBankStatament.amount > 0 ? 'Diterima' : 'Dikirim'}
                      </Text>
                    </Badge>
                    <Text size="sm" fw={700} c={themeColors.black[9]}>
                      {formatCurrency(Math.abs(SelectedBankStatament.amount))}
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Paper>
          )}

          <Text fw={600} size="sm" c={themeColors.black[9]}>
            Cari Jurnal Transaksi
          </Text>

          {/* Filters */}
          <Group grow>
            <Input
              placeholder="Cari kode atau nama akun..."
              leftSection={<MagnifyingGlass size={16} color={themeColors.gray[6]} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              styles={{ input: { color: themeColors.black[9] } }}
            />
            <DatePickerInput
              placeholder="Semua Tanggal"
              leftSection={<IconCalendar size={18} color={themeColors.gray[6]} />}
              value={selectedDate}
              onChange={(val) => setSelectedDate(val as Date | null)}
              clearable
              styles={{ input: { color: themeColors.black[9] } }}
            />
          </Group>

          {/* Journal Transactions Table */}
          <DataTable
            withTableBorder
            borderRadius="sm"
            fz="sm"
            columns={columns}
            records={filteredTransaction || []}
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
            minHeight={200}
            fetching={isLoading}
            loaderColor="teal"
            paginationColor="teal"
            styles={{
              header: { color: themeColors.black[9] },
            }}
          />

          {/* Modal Footer Info */}
          <Group justify="space-between" mt="sm">
            <Group gap="lg">
              <Group gap={4}>
                <Text size="sm" fw={500} c={themeColors.black[9]}>
                  Total Nominal:
                </Text>
                <Text size="sm" fw={700} c={themeColors.black[9]}>
                  {formatCurrency(totalNominal)}
                </Text>
              </Group>
              <Group gap={4}>
                <Text size="sm" fw={500} c={themeColors.black[9]}>
                  Dipilih:
                </Text>
                <Text size="sm" fw={700} c={themeColors.black[9]}>
                  {formatCurrency(selectedNominal)}
                </Text>
              </Group>
              <Group gap={4}>
                <Text size="sm" fw={500} c={themeColors.black[9]}>
                  Kekurangan:
                </Text>
                <Text
                  size="sm"
                  fw={700}
                  c={shortageNominal > 0 ? themeColors.red[7] : themeColors.teal[6]}
                >
                  {formatCurrency(Math.max(0, shortageNominal))}
                </Text>
              </Group>
              <Group gap={4}>
                <Text size="sm" fw={500} c={themeColors.black[9]}>
                  Kelebihan:
                </Text>
                <Text
                  size="sm"
                  fw={700}
                  c={excessNominal > 0 ? themeColors.red[7] : themeColors.teal[6]}
                >
                  {formatCurrency(Math.max(0, excessNominal))}
                </Text>
              </Group>
            </Group>
          </Group>
        </Stack>
      </CustomConfirmModal>

      <ConfirmModal
        opened={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleActualConfirm}
        title="Rekonsiliasi Rekening Koran"
        message="Apakah Anda yakin ingin merekonsiliasi transaksi ini?"
        helperText="Transaksi yang sudah direkonsiliasi tidak dapat dibatalkan."
        confirmLabel="Rekonsiliasi"
        cancelLabel="Batal"
        imageSrc={uploadTemplateImage}
        confirmButtonProps={{
          bg: themeColors.teal[5],
          leftSection: <PuzzlePieceIcon size={16} weight="duotone" />,
        }}
      />
    </>
  );
};
