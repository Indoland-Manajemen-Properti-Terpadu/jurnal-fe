import type { FormEvent, ReactNode } from 'react';
import type { Icon } from '@tabler/icons-react';
import { IconArrowLeft } from '@tabler/icons-react';
import { Box, Button, Grid, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';

/** The frame every posting form shares: header with a way back, notices, form cards left, summary right. */
export function TransactionFormLayout({
  icon,
  title,
  description,
  notices,
  onSubmit,
  main,
  summary,
}: Readonly<{
  icon: Icon;
  title: string;
  description: string;
  notices?: ReactNode;
  onSubmit: (event: FormEvent) => void;
  main: ReactNode;
  summary: ReactNode;
}>) {
  const { t } = useTranslation('bankCash');
  const navigate = useNavigate();

  return (
    <AppShellLayout withFooter>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={icon}
            title={title}
            description={description}
            actions={
              <Button
                variant="default"
                radius="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.bankCash.main)}
              >
                {t('common.backToCashBank')}
              </Button>
            }
          />
          {notices}
          <form onSubmit={onSubmit}>
            <Grid gutter="lg" align="flex-start">
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Stack gap="md">{main}</Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 4 }}>{summary}</Grid.Col>
            </Grid>
          </form>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
