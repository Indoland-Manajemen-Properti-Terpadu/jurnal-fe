import { Button, Rating } from '@mantine/core';
import { IconArrowRight, IconBook2, IconSparkles } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import { TrustMetricsBar } from './TrustMetricsBar';

interface HeroSectionProps {
  onLogin: () => void;
}

export function HeroSection({ onLogin }: HeroSectionProps) {
  const { t } = useTranslation('landing');

  return (
    <section id="top" className={classes.hero}>
      <div className={classes.heroGlow} />
      <div className={`${classes.container} ${classes.heroContent}`}>
        <div className={classes.ratingBadgeHero}>
          <Rating value={5} readOnly size="xs" color="yellow" />
          <span>
            <strong>{t('hero.ratingStrong')}</strong> {t('hero.ratingRest')}
          </span>
        </div>

        <h1 className={classes.heroTitle}>
          {t('hero.titleLead')} <br />
          <span className={classes.gradientText}>{t('hero.titleHighlight')}</span>
        </h1>

        <p className={classes.heroSubtitle}>{t('hero.subtitle')}</p>

        <div className={classes.heroActions}>
          <Button
            size="lg"
            radius="md"
            color="primary"
            rightSection={<IconArrowRight size={18} />}
            onClick={onLogin}
            style={{ fontWeight: 700, padding: '0 28px' }}
          >
            {t('hero.ctaStart')}
          </Button>
          <Button
            size="lg"
            radius="md"
            variant="default"
            component="a"
            href="#preview"
            leftSection={<IconSparkles size={18} color="var(--lp-sky)" />}
            style={{ fontWeight: 600 }}
          >
            {t('hero.ctaDemo')}
          </Button>
          <Button
            size="lg"
            radius="md"
            variant="subtle"
            color="gray"
            component="a"
            href="#ebooks"
            leftSection={<IconBook2 size={18} />}
            style={{ fontWeight: 600 }}
          >
            {t('hero.ctaEbook')}
          </Button>
        </div>

        <TrustMetricsBar />
      </div>
    </section>
  );
}
