import type { Icon as TablerIcon } from '@tabler/icons-react';
import {
  IconCircleCheckFilled,
  IconCoins,
  IconLanguage,
  IconLayersLinked,
  IconLock,
  IconScale,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import { SectionHead } from './SectionHead';

interface DifferentiatorCard {
  id: string;
  icon: TablerIcon;
}

const DIFFERENTIATOR_CARDS: readonly DifferentiatorCard[] = [
  { id: 'syncQueue', icon: IconLayersLinked },
  { id: 'approval', icon: IconShieldCheck },
  { id: 'guided', icon: IconScale },
  { id: 'precision', icon: IconCoins },
  { id: 'dualLanguage', icon: IconLanguage },
  { id: 'periodLock', icon: IconLock },
];

export function DifferentiatorSection() {
  const { t } = useTranslation('landing');

  return (
    <section id="advantages" className={classes.sectionAlt}>
      <div className={classes.container}>
        <SectionHead
          kicker={t('advantages.kicker')}
          title={t('advantages.title')}
          subtitle={t('advantages.subtitle')}
        />

        <div className={classes.diffCardsGrid}>
          {DIFFERENTIATOR_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className={classes.diffCard}>
                <span className={classes.diffCardBadge}>
                  {t(`advantages.cards.${card.id}.badge`)}
                </span>
                <div className={classes.diffCardIconWrapper}>
                  <Icon size={26} stroke={2} />
                </div>
                <h3 className={classes.diffCardTitle}>{t(`advantages.cards.${card.id}.title`)}</h3>
                <p className={classes.diffCardText}>{t(`advantages.cards.${card.id}.text`)}</p>
                <div className={classes.diffCardBenefit}>
                  <IconCircleCheckFilled size={16} /> {t(`advantages.cards.${card.id}.benefit`)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
