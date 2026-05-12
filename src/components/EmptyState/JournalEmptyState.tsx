import { Stack, Image, Title, Text, Button } from '@mantine/core';
import EmptyDataImage from '@/assets/img/Empty-Data.svg';
import { MoneyWavyIcon } from '@phosphor-icons/react';

interface JournalEmptyStateProps {
    onButtonClick: () => void;
}

export function JournalEmptyState({ onButtonClick }: JournalEmptyStateProps) {
    return (
      <Stack align="center" justify="center" h="70vh">
        <Image src={EmptyDataImage} alt="No data" w={210} h={141} />
        <Title order={4}>Belum Ada Transaksi Jurnal</Title>
        <Text c="dimmed" size="sm" ta="center">
          Transaksi jurnal belum tersedia. Silakan buat transaksi untuk mulai mencatat keuangan.
        </Text>
        <Button
          variant="light"
          color="black"
          leftSection={<MoneyWavyIcon size={14} />}
          onClick={onButtonClick}
          leftSection={<MoneyWavyIcon size={16} />}
        >
          Buat Jurnal Transaksi
        </Button>
      </Stack>
    );
}
