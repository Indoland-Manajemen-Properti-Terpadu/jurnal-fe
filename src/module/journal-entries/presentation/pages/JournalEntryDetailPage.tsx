import React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconPrinter, IconTrash, IconX } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import AppShellLayout from '@/components/AppShellLayout';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { isDetailBalanced, sumAmounts } from '../../domain/journalRules';
import { useJournalEntryDetail } from '../hooks/useJournalEntryDetail';
import { useDeleteJournalEntry } from '../hooks/useDeleteJournalEntry';
import JournalEntryLinesTable from '../components/JournalEntryLinesTable';
import JournalEntryHero from '../components/JournalEntryHero';
import JournalEntrySidebar from '../components/JournalEntrySidebar';
import DeleteJournalEntryModal from '../components/DeleteJournalEntryModal';

export const JournalEntryDetailPage: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  const navigate = useNavigate();
  const { idTransaction } = useParams<{ idTransaction: string }>();
  const { journalEntry, isError, isLoading } = useJournalEntryDetail(idTransaction!);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const deleteMutation = useDeleteJournalEntry();

  const handleConfirmDelete = () => {
    if (!idTransaction) return;
    deleteMutation.mutate(idTransaction, {
      onSuccess: () => {
        closeDelete();
        navigate(routes.generalJournal.main);
      },
    });
  };

  const lines = journalEntry?.transactionDetail || [];
  const totalDebit = sumAmounts(lines.map((item) => Number(item.debit) || 0));
  const totalCredit = sumAmounts(lines.map((item) => Number(item.credit) || 0));
  const isBalanced = isDetailBalanced(totalDebit, totalCredit);

  if (isLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={50} radius="md" />
            <Skeleton height={140} radius="lg" />
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Skeleton height={350} radius="md" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Skeleton height={350} radius="md" />
              </Grid.Col>
            </Grid>
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }

  if (isError || !journalEntry) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder p="xl" radius="lg" ta="center" bg="white">
            <Avatar size={64} radius="xl" color="red" variant="light" mx="auto" mb="md">
              <IconX size={32} />
            </Avatar>
            <Title order={3} c="dark.8">
              {t('detail.notFoundTitle')}
            </Title>
            <Text c="dimmed" size="sm" mt="xs" mb="lg">
              {t('detail.notFoundBody')}
            </Text>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(routes.generalJournal.main)}
            >
              {t('detail.backToJournal')}
            </Button>
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  const hasMemo = journalEntry.notes && journalEntry.notes !== '-';

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'lg' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 60%, var(--mantine-color-secondary-0) 100%)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => navigate(-1)}
              >
                {t('detail.back')}
              </Button>

              <Group gap="xs">
                <Button
                  variant="default"
                  leftSection={<IconPrinter size={16} />}
                  onClick={() => window.print()}
                >
                  {t('detail.print')}
                </Button>

                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  loading={deleteMutation.isPending}
                  onClick={openDelete}
                >
                  {t('detail.delete')}
                </Button>
              </Group>
            </Group>
          </Paper>

          <JournalEntryHero entry={journalEntry} isBalanced={isBalanced} />

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="md">
                    <Text fw={700} size="md" c="primary.9">
                      {t('detail.linesCard')}
                    </Text>
                    <Badge size="sm" variant="light" color="primary">
                      {t('detail.linesBadge', { count: lines.length })}
                    </Badge>
                  </Group>

                  <JournalEntryLinesTable
                    transactionDetails={journalEntry.transactionDetail}
                    isLoading={isLoading}
                    withBorder={false}
                  />
                </Card>

                <Card withBorder radius="md" p="lg" bg="white">
                  <Text fw={700} size="md" c="primary.9" mb="xs">
                    {t('detail.memoCard')}
                  </Text>
                  <Box
                    p="sm"
                    style={{
                      backgroundColor: 'var(--mantine-color-gray-0)',
                      borderRadius: 8,
                      minHeight: 72,
                    }}
                  >
                    <Text size="sm" c={hasMemo ? 'dark.8' : 'dimmed'}>
                      {hasMemo ? journalEntry.notes : t('detail.memoEmpty')}
                    </Text>
                  </Box>
                </Card>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <JournalEntrySidebar
                entry={journalEntry}
                totalDebit={totalDebit}
                totalCredit={totalCredit}
                isBalanced={isBalanced}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      <DeleteJournalEntryModal
        opened={deleteOpened}
        onClose={closeDelete}
        onDelete={handleConfirmDelete}
      />
    </AppShellLayout>
  );
};

export default JournalEntryDetailPage;
