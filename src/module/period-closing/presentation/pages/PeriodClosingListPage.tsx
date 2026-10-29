import { useState } from 'react';
import { Button, Container, Group, Paper, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { gradientColors, themeColors } from '@/theme';
import PeriodFooter from '../components/PeriodFooter';
import SaveAsDraftModal from '../components/ModalSaveAsDraft';
import PeriodClosingLayout from './PeriodClosingLayout';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

const PeriodClosingListPage = () => {
  const { t } = useTranslation('periodClosing');
  const navigate = useNavigate();
  const [isConfirmDraftModalOpen, setIsConfirmDraftModalOpen] = useState(false);
  const openConfirmSaveDraft = () => setIsConfirmDraftModalOpen(true);
  const closeConfirmSaveDraft = () => setIsConfirmDraftModalOpen(false);

  const handleSaveAsDraft = () => {
    notifications.show({
      color: themeColors.red[6],
      autoClose: 3000,
      title: t('list.savedTitle'),
      message: t('common.draftNotice'),
    });
    closeConfirmSaveDraft();
  };

  return (
    <>
      <PeriodClosingLayout
        footer={
          <PeriodFooter
            onBack={() => navigate(-1)}
            onNext={openConfirmSaveDraft}
            nextLabel={t('common.confirm')}
          />
        }
      >
        <Container fluid>
          <Stack gap="lg">
            <Paper {...PAPER_PROPS}>
              <Group justify="space-between">
                <Title order={3}>{t('list.title')}</Title>
                <Group>
                  <Button variant="light" color={themeColors.gray[7]} onClick={() => navigate(-1)}>
                    {t('list.addPeriodLock')}
                  </Button>
                  <Button
                    variant="gradient"
                    gradient={gradientColors.gradient}
                    onClick={openConfirmSaveDraft}
                  >
                    {t('list.startClosing')}
                  </Button>
                </Group>
              </Group>
            </Paper>
            <Paper {...PAPER_PROPS}>
              <Stack align="stretch" justify="flex-start" gap="sm" />
            </Paper>
          </Stack>
        </Container>
      </PeriodClosingLayout>
      <SaveAsDraftModal
        opened={isConfirmDraftModalOpen}
        onClose={closeConfirmSaveDraft}
        onSave={handleSaveAsDraft}
      />
    </>
  );
};

export default PeriodClosingListPage;
