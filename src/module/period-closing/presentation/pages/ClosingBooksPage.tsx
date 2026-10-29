import {
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { TextMediumGR } from '@/components/Text/CustomText';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';
import { PROTOTYPE_ACCOUNT_OPTIONS, PROTOTYPE_PERIOD_END } from '../../domain/prototypeData';
import PeriodFooter from '../components/PeriodFooter';
import WorkingPaperTable from '../components/WorkingPaperTable';
import PeriodClosingLayout from './PeriodClosingLayout';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

const ClosingBooksPage = () => {
  const { t } = useTranslation('periodClosing');
  const navigate = useNavigate();
  const accountSelect = (label: string) => (
    <Select
      withAsterisk
      label={label}
      placeholder={t('closingBooks.chooseAccount')}
      data={PROTOTYPE_ACCOUNT_OPTIONS}
      rightSection={<IconChevronDown size={16} />}
    />
  );

  return (
    <PeriodClosingLayout
      footer={
        <PeriodFooter
          onBack={() => navigate(routes.generalJournal.main)}
          onNext={() => navigate(routes.PeriodAndClosingBook.FinancialStatement)}
          nextLabel={t('common.continue')}
        />
      }
    >
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <Stack gap={2}>
              <Title order={3}>{t('closingBooks.title')}</Title>
              <Text c={themeColors.gray[6]} fz={14}>
                {t('closingBooks.subtitle', { date: PROTOTYPE_PERIOD_END })}
              </Text>
            </Stack>
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack align="stretch" justify="flex-start" gap="sm">
              <TextMediumGR>{t('closingBooks.workingPaper')}</TextMediumGR>
              <WorkingPaperTable />
              <TextMediumGR>{t('closingBooks.taxSection')}</TextMediumGR>
              <Group grow>
                {accountSelect(t('closingBooks.taxExpenseAccount'))}
                {accountSelect(t('closingBooks.taxExpensePayable'))}
              </Group>
              <TextMediumGR>{t('closingBooks.netProfit')}</TextMediumGR>
              {accountSelect(t('closingBooks.retainedEarnings'))}
              <TextMediumGR>{t('closingBooks.netProfit')}</TextMediumGR>
              <Group grow>
                <NumberInput
                  label={t('closingBooks.total')}
                  withAsterisk
                  placeholder="0,00"
                  rightSection={<IconChevronDown size={16} />}
                />
              </Group>
              <Divider />
              <Textarea label={t('closingBooks.notes')} placeholder={t('closingBooks.addNotes')} />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </PeriodClosingLayout>
  );
};

export default ClosingBooksPage;
