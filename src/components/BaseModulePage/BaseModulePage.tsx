import { Alert, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import PageHeader from '@/components/PageHeader/PageHeader';
import { useTranslation } from '@/i18n';

type BaseModulePageProps = {
  title: string;
  description: string;
  routePath: string;
};

const BaseModulePage = ({ title, description, routePath }: BaseModulePageProps) => {
  const { t } = useTranslation('common');

  return (
    <Container fluid>
      <Stack gap="lg">
        <Paper p="md" shadow="sm" radius="md">
          <PageHeader title={title} withinBreadcums />
        </Paper>

        <Paper p="lg" shadow="sm" radius="md">
          <Stack gap="sm">
            <Title order={4}>{title}</Title>
            <Text c="dimmed">{description}</Text>
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="primary"
              variant="light"
              title={t('moduleInfoTitle')}
            >
              {t('activeRoute')}: {routePath}
            </Alert>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export { BaseModulePage };
