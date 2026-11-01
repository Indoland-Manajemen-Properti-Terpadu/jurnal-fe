import { Button } from '@mantine/core';
import { IconReceipt } from '@tabler/icons-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';

interface LandingHeaderProps {
  onLogin: () => void;
}

const NAV_LINKS = [
  { href: '#advantages', labelKey: 'header.navAdvantages' },
  { href: '#preview', labelKey: 'header.navPreview' },
  { href: '#comparison', labelKey: 'header.navComparison' },
  { href: '#ebooks', labelKey: 'header.navEbooks' },
  { href: '#testimonials', labelKey: 'header.navTestimonials' },
  { href: '#faq', labelKey: 'header.navFaq' },
] as const;

export function LandingHeader({ onLogin }: LandingHeaderProps) {
  const { t } = useTranslation('landing');

  return (
    <header className={classes.header}>
      <div className={`${classes.container} ${classes.headerInner}`}>
        <a href="#top" className={classes.brand}>
          <span className={classes.brandMark}>
            <IconReceipt size={20} stroke={2.2} />
          </span>
          <span>{t('brandName')}</span>
          <span className={classes.brandBadge}>{t('header.badge')}</span>
        </a>

        <nav className={classes.nav}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={classes.navLink}>
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        <div className={classes.headerActions}>
          <LanguageSwitcher variant="compact" />
          <Button
            color="primary"
            radius="md"
            size="sm"
            onClick={onLogin}
            style={{ fontWeight: 700 }}
          >
            {t('header.login')}
          </Button>
        </div>
      </div>
    </header>
  );
}
