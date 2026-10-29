import { Button, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconDownload, IconSparkles } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';

interface FinalCtaSectionProps {
  onLogin: () => void;
}

const PERK_KEYS = ['perkInstall', 'perkMigration', 'perkGuarantee'] as const;

export function FinalCtaSection({ onLogin }: FinalCtaSectionProps) {
  const { t } = useTranslation('landing');

  return (
    <section className={classes.section}>
      <div className={classes.container}>
        <div className={classes.cta}>
          <div className={classes.ctaInner}>
            <ThemeIcon
              size={64}
              radius="xl"
              color="secondary.6"
              variant="filled"
              style={{ margin: '0 auto' }}
            >
              <IconSparkles size={34} stroke={2} />
            </ThemeIcon>
            <h2 className={classes.ctaTitle} style={{ marginTop: 24 }}>
              {t('cta.title')}
            </h2>
            <p className={classes.ctaText}>{t('cta.text')}</p>

            <div
              style={{
                marginTop: 36,
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                size="xl"
                radius="md"
                color="secondary.6"
                rightSection={<IconArrowRight size={20} />}
                onClick={onLogin}
                style={{ fontWeight: 800, padding: '0 36px' }}
              >
                {t('cta.login')}
              </Button>
              <Button
                size="xl"
                radius="md"
                variant="white"
                color="dark"
                component="a"
                href="#ebooks"
                leftSection={<IconDownload size={20} />}
                style={{ fontWeight: 700 }}
              >
                {t('cta.ebook')}
              </Button>
            </div>

            <div
              style={{
                marginTop: 24,
                fontSize: 13,
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              {PERK_KEYS.map((key) => (
                <span key={key}>{t(`cta.${key}`)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
