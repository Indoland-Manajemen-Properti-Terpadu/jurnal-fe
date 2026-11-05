import React, { useEffect, useState } from 'react';
import { Group, Image, Stack, Text, Title } from '@mantine/core';
import BrandIcon from '@/assets/images/brand/icon.svg';
import { useTranslation } from '@/i18n';
import { ReconciliationSlide, ReportSlide, SyncSlide } from './AuthSlides';
import classes from './Auth.module.css';

const SLIDES = [
  { id: 'slide1', Illustration: SyncSlide },
  { id: 'slide2', Illustration: ReportSlide },
  { id: 'slide3', Illustration: ReconciliationSlide },
] as const;

const INTERVAL_MS = 6500;

/** Left panel of the login page: the brand and three sample previews of the product. */
export const AuthShowcase: React.FC = () => {
  const { t } = useTranslation('authentication');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduceMotion) return undefined;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % SLIDES.length),
      INTERVAL_MS
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className={classes.showcase}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('visual.showcaseLabel')}
    >
      <Group gap="sm" style={{ position: 'relative', zIndex: 1 }}>
        <Image src={BrandIcon} w={36} h={36} radius="md" alt="" />
        <Text fw={700} fz="md" c="white">
          {t('visual.brand')}
        </Text>
      </Group>

      <div className={classes.stage} style={{ position: 'relative', zIndex: 1 }}>
        {SLIDES.map(({ id, Illustration }, index) => (
          <div
            key={id}
            className={classes.slide}
            data-active={index === active}
            aria-hidden={index !== active}
            role="group"
            aria-roledescription="slide"
          >
            <div className={classes.scaled}>
              <Illustration />
            </div>
          </div>
        ))}
      </div>

      <Stack gap="xs" style={{ position: 'relative', zIndex: 1 }} mih={150}>
        <Text fz="xs" fw={600} c="blue.2" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
          {t('visual.example')}
        </Text>
        <Title order={2} fz={30} fw={700} c="white" lh={1.2} maw={460}>
          {t(`${SLIDES[active].id}.title`)}
        </Title>
        <Text fz="md" c="blue.1" maw={460} lh={1.55}>
          {t(`${SLIDES[active].id}.description`)}
        </Text>
      </Stack>

      <Group gap={8} mt="md" style={{ position: 'relative', zIndex: 1 }}>
        {SLIDES.map(({ id }, index) => (
          <button
            key={id}
            type="button"
            className={classes.dot}
            data-active={index === active}
            aria-label={t('visual.goToSlide', { n: index + 1 })}
            aria-current={index === active}
            onClick={() => setActive(index)}
          />
        ))}
      </Group>
    </section>
  );
};
