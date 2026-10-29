import type { ReactNode } from 'react';
import { Accordion, Text } from '@mantine/core';
import {
  IconCoins,
  IconFileSpreadsheet,
  IconLanguage,
  IconLayersLinked,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import { SectionHead } from './SectionHead';

type Translate = (key: string) => string;

interface FaqItem {
  id: string;
  value: string;
  icon: ReactNode;
  renderAnswer: (t: Translate) => ReactNode;
}

const iconProps = { size: 20, color: 'var(--lp-navy)' };

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'migration',
    value: 'migration',
    icon: <IconFileSpreadsheet {...iconProps} />,
    renderAnswer: (t) => t('faq.items.migration.answer'),
  },
  {
    id: 'operationalSync',
    value: 'operational-sync',
    icon: <IconLayersLinked {...iconProps} />,
    renderAnswer: (t) => (
      <>
        {t('faq.items.operationalSync.answerBefore')}{' '}
        <em>{t('faq.items.operationalSync.answerEmphasis')}</em>{' '}
        {t('faq.items.operationalSync.answerAfter')}
      </>
    ),
  },
  {
    id: 'pendingChanges',
    value: 'pending-changes',
    icon: <IconShieldCheck {...iconProps} />,
    renderAnswer: (t) => (
      <>
        {t('faq.items.pendingChanges.answerBefore')}{' '}
        <strong>{t('faq.items.pendingChanges.answerEmphasis')}</strong>{' '}
        {t('faq.items.pendingChanges.answerAfter')}
      </>
    ),
  },
  {
    id: 'multiDecimal',
    value: 'multi-decimal',
    icon: <IconCoins {...iconProps} />,
    renderAnswer: (t) => t('faq.items.multiDecimal.answer'),
  },
  {
    id: 'bilingual',
    value: 'bilingual',
    icon: <IconLanguage {...iconProps} />,
    renderAnswer: (t) => t('faq.items.bilingual.answer'),
  },
];

export function FaqSection() {
  const { t } = useTranslation('landing');

  return (
    <section id="faq" className={classes.sectionAlt}>
      <div className={classes.container}>
        <SectionHead kicker={t('faq.kicker')} title={t('faq.title')} subtitle={t('faq.subtitle')} />

        <div className={classes.faqContainer}>
          <Accordion variant="separated" radius="md">
            {FAQ_ITEMS.map((item) => (
              <Accordion.Item key={item.value} value={item.value}>
                <Accordion.Control icon={item.icon}>
                  <strong>{t(`faq.items.${item.id}.question`)}</strong>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text fz="sm" c="dimmed" lh={1.65}>
                    {item.renderAnswer(t)}
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
