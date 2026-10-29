import React, { useState } from 'react';
import { Modal, Button, Group, Text, Stack, Alert, List, ThemeIcon, Badge } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconInfoCircle, IconArrowRight, IconScale } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { formatDate, dateFormatV1 } from '@/utils/FormatDate';
import { useInitialBalanceStore } from '@/store/GeneralJournal/initialBalanceAccount';

interface BeginningBalanceModalProps {
  opened: boolean;
  onClose: () => void;
}

export const BeginningBalanceModal: React.FC<BeginningBalanceModalProps> = ({
  opened,
  onClose,
}) => {
  const navigate = useNavigate();
  const { setConverstion, conversionDate } = useInitialBalanceStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    conversionDate ? dayjs(conversionDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );

  const handleConfirm = () => {
    if (!selectedDate) {
      notifications.show({
        color: 'red',
        title: 'Tanggal Konversi Wajib Dipilih',
        message: 'Silakan pilih tanggal efektif cutoff saldo awal buku besar.',
      });
      return;
    }

    setConverstion(new Date(selectedDate));
    onClose();
    navigate(routes.generalJournal.beginningBalance);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius="lg"
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" variant="light" color="primary">
            <IconScale size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={16} c="dark.8">
              Atur Tanggal Konversi Saldo Awal
            </Text>
            <Text size="xs" c="dimmed">
              Cutoff Periode Pembukuan Awal
            </Text>
          </div>
        </Group>
      }
      styles={{
        header: {
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
        },
        body: {
          padding: '20px',
        },
      }}
    >
      <Stack gap="md">
        <DatePickerInput
          label="Tanggal Konversi (Cutoff Date)"
          description={
            selectedDate
              ? `Saldo awal akan diakui efektif per tanggal ${dateFormatV1(selectedDate)}`
              : 'Pilih tanggal awal pembukuan neraca saldo awal'
          }
          placeholder="Pilih Tanggal Konversi"
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          leftSection={<IconCalendar size={18} />}
          value={selectedDate}
          onChange={setSelectedDate}
          withAsterisk
          clearable={false}
        />

        <Alert
          variant="light"
          color="blue"
          title="Panduan Penting Saldo Awal"
          icon={<IconInfoCircle size={18} />}
          radius="md"
        >
          <List size="xs" spacing={6} c="dark.7">
            <List.Item>
              Tanggal konversi adalah tanggal acuan saat saldo awal neraca pertama kali dimasukkan
              ke sistem.
            </List.Item>
            <List.Item>
              Anda tetap dapat menyesuaikan tanggal konversi dan nilai saldo awal selama periode
              buku belum ditutup.
            </List.Item>
            <List.Item>
              Total nilai <strong>Debit</strong> dan <strong>Kredit</strong> harus seimbang
              (balance) agar saldo awal dapat dipublikasikan.
            </List.Item>
          </List>
        </Alert>

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" onClick={onClose} radius="md">
            Batal
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            onClick={handleConfirm}
            radius="md"
            rightSection={<IconArrowRight size={16} />}
          >
            Lanjut ke Saldo Awal
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default BeginningBalanceModal;
