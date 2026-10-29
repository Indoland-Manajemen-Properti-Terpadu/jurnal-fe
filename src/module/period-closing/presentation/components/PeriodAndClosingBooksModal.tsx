import { Button, Alert, Stack, Divider, Text, Container, Image } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { TextMediumGR } from '@/components/Text/CustomText';
import { themeColors, buttonGradient } from '@/theme';
import { routes } from '@/router/routes';
import { InformationAlert } from '@/components/Alert/Alert';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import { useTranslation } from '@/i18n';
import KeyPeriodeImage from '@/assets/img/closing_period.svg';
import { PROTOTYPE_LOCK_DATE } from '../../domain/prototypeData';
import usePeriodModalStore from '../store/usePeriodModals';

interface PeriodAndClosingBooksModalProps {
  opened: boolean;
  onClose: () => void;
}

const DateFields = () => {
  const { t } = useTranslation('periodClosing');

  return (
    <>
      <DatePickerInput
        placeholder={t('modal.fromBeginning')}
        label={t('modal.fromDate')}
        rightSection={<IconCalendar />}
        withAsterisk
        disabled
      />
      <DatePickerInput
        placeholder={t('modal.pickDate')}
        label={t('modal.toDate')}
        rightSection={<IconCalendar />}
        withAsterisk
      />
    </>
  );
};

const CheckMessage = () => {
  const { t } = useTranslation('periodClosing');

  return (
    <Stack gap="md" align="stretch" justify="center">
      <Text fz={14} fw={400} c={themeColors.black[9]}>
        {t('modal.checkMessage')}
      </Text>
    </Stack>
  );
};

export const PeriodAndClosingBooksModal: React.FC<PeriodAndClosingBooksModalProps> = ({
  opened,
  onClose,
}) => {
  const { t } = useTranslation('periodClosing');
  const navigate = useNavigate();
  const {
    PLDateSettingOpened,
    CBDateSettingOpened,
    PLConfirmOpened,
    CBConfirmOpened,
    setPLDateSettingOpened,
    setCBDateSettingOpened,
    setPLConfirmOpened,
    setCBConfirmOpened,
    cancelToCheckPL,
    cancelToCheckCB,
    closeAllModals,
  } = usePeriodModalStore();

  const handleFinalConfirmCheck = () => {
    notifications.show({
      color: themeColors.green[6],
      autoClose: 3000,
      title: t('modal.closedTitle'),
      message: t('common.draftNotice'),
    });
    closeAllModals();
    navigate(routes.generalJournal.closingBooks);
  };

  const benefitItems = [t('modal.benefitItem1'), t('modal.benefitItem2')];

  return (
    <>
      <CustomConfirmModal
        key="MainMenu"
        size="55rem"
        opened={opened}
        onClose={onClose}
        withCloseButton={true}
        title={<TextMediumGR>{t('modal.title')}</TextMediumGR>}
        labels={{
          confirm: (
            <Button
              variant="gradient"
              gradient={buttonGradient.gradient}
              onClick={() => {
                onClose();
                setCBDateSettingOpened(true);
              }}
            >
              {t('modal.startClosing')}
            </Button>
          ),
          cancel: (
            <Button
              variant="light"
              color={themeColors.gray[7]}
              onClick={() => {
                onClose();
                setPLDateSettingOpened(true);
              }}
            >
              {t('modal.startLock')}
            </Button>
          ),
        }}
      >
        <Stack gap="md" align="stretch" justify="center">
          <Divider />
          <Container
            size="xs"
            styles={(theme) => ({
              root: {
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
              },
            })}
          >
            <Image src={KeyPeriodeImage} fit="contain" height={250} />
          </Container>
          <Text fz={20} fw={600} c={themeColors.black[9]} ta="center">
            {t('modal.featureTitle')}
          </Text>
          <Text fz={14} fw={500} c={themeColors.gray[7]} ta="center">
            {t('modal.featureDescription')}
          </Text>
          <InformationAlert
            title={t('modal.importantTitle')}
            color="yellow"
            items={[t('modal.importantItem1'), t('modal.importantItem2')]}
          />
          <InformationAlert
            title={t('modal.lockBenefitsTitle')}
            color="blue"
            items={benefitItems}
          />
          <InformationAlert
            title={t('modal.closingBenefitsTitle')}
            color="blue"
            items={benefitItems}
          />
          <Divider />
        </Stack>
      </CustomConfirmModal>

      {/* FLOW PERIOD LOCK */}
      <CustomConfirmModal
        key="PLDateSetting"
        size="55rem"
        opened={PLDateSettingOpened}
        onClose={closeAllModals}
        withCloseButton={true}
        title={<TextMediumGR>{t('modal.lockDateTitle')}</TextMediumGR>}
        labels={{
          confirm: (
            <Button
              variant="gradient"
              gradient={buttonGradient.gradient}
              onClick={() => setPLConfirmOpened(true)}
            >
              {t('modal.setDate')}
            </Button>
          ),
          cancel: (
            <Button variant="light" color={themeColors.gray[7]} onClick={closeAllModals}>
              {t('common.cancel')}
            </Button>
          ),
        }}
      >
        <Stack gap="md" align="stretch" justify="center">
          <Divider />
          <DateFields />
          <InformationAlert
            title={t('modal.importantTitle')}
            color="blue"
            variant="normal"
            items={[t('modal.lockNotice', { date: PROTOTYPE_LOCK_DATE })]}
          />
          <Divider />
        </Stack>
      </CustomConfirmModal>

      <CustomConfirmModal
        key="PLConfirm"
        opened={PLConfirmOpened}
        onClose={cancelToCheckPL}
        withCloseButton={true}
        title={<TextMediumGR>{t('modal.checkTitle')}</TextMediumGR>}
        labels={{
          confirm: (
            <Button
              variant="gradient"
              gradient={buttonGradient.gradient}
              onClick={handleFinalConfirmCheck}
            >
              {t('common.continue')}
            </Button>
          ),
          cancel: (
            <Button variant="light" color={themeColors.gray[7]} onClick={cancelToCheckPL}>
              {t('common.cancel')}
            </Button>
          ),
        }}
      >
        <CheckMessage />
      </CustomConfirmModal>

      {/* FLOW CLOSING BOOKS */}
      <CustomConfirmModal
        key="CBDateSetting"
        size="55rem"
        opened={CBDateSettingOpened}
        onClose={closeAllModals}
        withCloseButton={true}
        title={<TextMediumGR>{t('modal.closingDateTitle')}</TextMediumGR>}
        labels={{
          confirm: (
            <Button
              variant="gradient"
              gradient={buttonGradient.gradient}
              onClick={() => setCBConfirmOpened(true)}
            >
              {t('modal.setDate')}
            </Button>
          ),
          cancel: (
            <Button variant="light" color={themeColors.gray[7]} onClick={closeAllModals}>
              {t('common.cancel')}
            </Button>
          ),
        }}
      >
        <Stack gap="md" align="stretch" justify="center">
          <Divider />
          <DateFields />
          <Alert
            variant="light"
            color="blue"
            title={t('modal.importantTitle')}
            icon={<IconInfoCircle />}
            p="xs"
          >
            {t('modal.lockNoticeLead')} <strong>{PROTOTYPE_LOCK_DATE}.</strong>
          </Alert>
          <Divider />
        </Stack>
      </CustomConfirmModal>

      <CustomConfirmModal
        key="CBConfirm"
        opened={CBConfirmOpened}
        onClose={cancelToCheckCB}
        withCloseButton={true}
        title={<TextMediumGR>{t('modal.checkTitle')}</TextMediumGR>}
        labels={{
          confirm: (
            <Button
              variant="gradient"
              gradient={buttonGradient.gradient}
              onClick={handleFinalConfirmCheck}
            >
              {t('common.continue')}
            </Button>
          ),
          cancel: (
            <Button variant="light" color={themeColors.gray[7]} onClick={cancelToCheckCB}>
              {t('common.cancel')}
            </Button>
          ),
        }}
      >
        <CheckMessage />
      </CustomConfirmModal>
    </>
  );
};
