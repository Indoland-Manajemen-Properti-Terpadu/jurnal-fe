import { useEffect, useState } from 'react';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useMediaQuery, useReducedMotion } from '@mantine/hooks';
import BrandIcon from '@/assets/images/brand/icon.svg';
import ledgerArt from '@/assets/images/auth/ledger.webp';
import reportsArt from '@/assets/images/auth/reports.webp';
import reconciliationArt from '@/assets/images/auth/reconciliation.webp';
import { useTranslation } from '@/i18n';
import classes from './Auth.module.css';

const SLIDES = [
  { id: 'slide1', artwork: ledgerArt },
  { id: 'slide2', artwork: reportsArt },
  { id: 'slide3', artwork: reconciliationArt },
] as const;

export function AuthShowcase() {
  const { t } = useTranslation('authentication');
  const [active, setActive] = useState(0);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 75em)');
  const current = SLIDES[active].id;

  useEffect(() => {
    if (!rotationEnabled || hovered || focused || reducedMotion || !desktop) return undefined;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % SLIDES.length), 8000);
    return () => window.clearInterval(timer);
  }, [rotationEnabled, hovered, focused, reducedMotion, desktop]);

  return (
    <section
      className={classes.showcase}
      aria-roledescription="carousel"
      aria-label={t('visual.showcaseLabel')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className={classes.brand}>
        <img src={BrandIcon} width={36} height={36} alt="" />
        <span>{t('visual.brand')}</span>
      </div>

      <div
        className={classes.heroCopy}
        aria-live={rotationEnabled ? 'off' : 'polite'}
        aria-atomic="true"
      >
        <p className={classes.eyebrow}>{t('visual.category')}</p>
        <h2 className={classes.heroTitle}>
          {t(`${current}.title`)}
          <span>{t(`${current}.accent`)}</span>
        </h2>
        <p className={classes.heroDescription}>{t(`${current}.description`)}</p>
      </div>

      <div className={classes.artStage} aria-hidden="true">
        {SLIDES.map(({ id, artwork }, index) => (
          <img
            key={id}
            className={classes.artwork}
            data-active={index === active}
            src={artwork}
            alt=""
            width={1536}
            height={1024}
            decoding="async"
          />
        ))}
      </div>

      <div className={classes.showcaseFooter}>
        <div className={classes.slideNavigation}>
          {SLIDES.map(({ id }, index) => (
            <button
              key={id}
              type="button"
              className={classes.slideButton}
              data-active={index === active}
              aria-label={t('visual.goToSlide', { title: t(`${id}.label`) })}
              aria-current={index === active}
              onClick={() => {
                setActive(index);
                setRotationEnabled(false);
              }}
            >
              <span className={classes.slideNumber}>{String(index + 1).padStart(2, '0')}</span>
              {t(`${id}.label`)}
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            className={classes.rotationButton}
            aria-label={t(rotationEnabled ? 'visual.pause' : 'visual.play')}
            onClick={() => setRotationEnabled((enabled) => !enabled)}
          >
            {rotationEnabled ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
          </button>
        )}
      </div>
    </section>
  );
}
