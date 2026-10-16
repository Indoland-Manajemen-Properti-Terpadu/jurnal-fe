import React from 'react';
import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Timeline,
  Paper,
  Divider,
  ScrollArea,
  ThemeIcon,
  Button,
} from '@mantine/core';
import {
  IconHistory,
  IconCheck,
  IconFileText,
  IconCalendar,
  IconUser,
  IconScale,
} from '@tabler/icons-react';
import { useDraftBalanceLogs } from '../hooks/useDraftBalance';
import { formatDate } from '@/utils/FormatDate';
import { formatCurrency } from '@/utils/FormatCurrency';

interface BeginningBalanceLogsModalProps {
  opened: boolean;
  onClose: () => void;
}

export const BeginningBalanceLogsModal: React.FC<BeginningBalanceLogsModalProps> = ({
  opened,
  onClose,
}) => {
  const { data: logsData, isLoading, isError } = useDraftBalanceLogs(opened);

  const logs: any[] = Array.isArray(logsData) ? logsData : (logsData as any)?.data || [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      radius="lg"
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" variant="light" color="indigo">
            <IconHistory size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={16} c="dark.8">
              Riwayat Perubahan Saldo Awal
            </Text>
            <Text size="xs" c="dimmed">
              Audit trail & pencatatan aktivitas publikasi
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
      {isLoading ? (
        <Center py={60}>
          <Stack align="center" gap="xs">
            <Loader size="md" color="primary.6" />
            <Text size="xs" c="dimmed">
              Memuat log riwayat saldo awal...
            </Text>
          </Stack>
        </Center>
      ) : isError ? (
        <Center py={40}>
          <Text size="sm" c="red.6">
            Gagal memuat data riwayat saldo awal.
          </Text>
        </Center>
      ) : logs.length === 0 ? (
        <Center py={40}>
          <Stack align="center" gap="xs">
            <ThemeIcon size={44} radius="xl" color="gray" variant="light">
              <IconHistory size={24} />
            </ThemeIcon>
            <Text size="sm" fw={600} c="dark.7">
              Belum Ada Riwayat Perubahan
            </Text>
            <Text size="xs" c="dimmed" maw={300} ta="center">
              Aktivitas penyimpanan draf dan publikasi saldo awal akan tercatat secara otomatis di
              sini.
            </Text>
          </Stack>
        </Center>
      ) : (
        <ScrollArea h={420} offsetScrollbars>
          <Timeline active={0} bulletSize={28} lineWidth={2}>
            {logs.map((log) => {
              const isPublish = log.action === 'PUBLISH';
              const balances: any[] = log.balances || [];
              const totalDebit = balances.reduce((sum, b) => sum + (Number(b.debit) || 0), 0);
              const totalCredit = balances.reduce((sum, b) => sum + (Number(b.credit) || 0), 0);

              return (
                <Timeline.Item
                  key={log.id || log._id || log.createdAt}
                  bullet={
                    isPublish ? (
                      <ThemeIcon size={24} radius="xl" color="teal">
                        <IconCheck size={14} />
                      </ThemeIcon>
                    ) : (
                      <ThemeIcon size={24} radius="xl" color="blue">
                        <IconFileText size={14} />
                      </ThemeIcon>
                    )
                  }
                  title={
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs">
                        <Badge color={isPublish ? 'teal' : 'blue'} variant="filled" size="sm">
                          {isPublish ? 'PUBLIKASI' : 'PERBARUI DRAF'}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {formatDate(new Date(log.createdAt))}
                        </Text>
                      </Group>
                    </Group>
                  }
                >
                  <Paper withBorder radius="md" p="sm" mt="xs" bg="gray.0">
                    <Stack gap={6}>
                      <Group justify="space-between" align="center">
                        <Group gap={6}>
                          <IconUser size={14} color="gray" />
                          <Text size="xs" fw={600} c="dark.8">
                            {log.performedBy?.name || 'Finance'} ({log.performedBy?.email || '-'})
                          </Text>
                        </Group>
                        <Group gap={6}>
                          <IconCalendar size={14} color="gray" />
                          <Text size="xs" c="dimmed">
                            Periode: {log.period ? formatDate(new Date(log.period)) : '-'}
                          </Text>
                        </Group>
                      </Group>

                      <Divider my={2} />

                      <Group justify="space-between" align="center">
                        <Text size="xs" c="dimmed">
                          {balances.length} Akun Dicatat
                        </Text>
                        <Group gap="md">
                          <Text size="xs" fw={600} c="teal.7">
                            Debit: {formatCurrency(totalDebit)}
                          </Text>
                          <Text size="xs" fw={600} c="indigo.7">
                            Kredit: {formatCurrency(totalCredit)}
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  </Paper>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </ScrollArea>
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} size="sm" radius="md">
          Tutup
        </Button>
      </Group>
    </Modal>
  );
};

export default BeginningBalanceLogsModal;
