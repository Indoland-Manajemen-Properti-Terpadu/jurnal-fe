import { Stack, Image, Title, Text, Button } from '@mantine/core';
import EmptyDataImage from '@/assets/img/vectors/Empty-Data.svg';
import { MoneyWavyIcon } from '@phosphor-icons/react';

interface JournalEmptyStateProps {
    onButtonClick: () => void;
    title?: string;
    description?: string;
    buttonLabel?: string;
    buttonIcon?: React.ReactNode;
}

export function JournalEmptyState({ 
    onButtonClick, 
    title = "Belum Ada Transaksi Jurnal",
    description = "Transaksi jurnal belum tersedia. Silakan buat transaksi untuk mulai mencatat keuangan.",
    buttonLabel = "Buat Jurnal Transaksi",
    buttonIcon = <MoneyWavyIcon size={16} />
}: JournalEmptyStateProps) {
    return (
      <Stack align="center" justify="center" h="70vh">
        <Image src={EmptyDataImage} alt="No data" w={210} h={141} />
        <Title order={4}>{title}</Title>
        <Text c="dimmed" size="sm" ta="center">
          {description}
        </Text>
        <Button
          variant="light"
          color="black"
          onClick={onButtonClick}
          leftSection={buttonIcon}
        >
          {buttonLabel}
        </Button>
      </Stack>
    );
}
