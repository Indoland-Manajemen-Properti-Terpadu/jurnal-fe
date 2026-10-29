import { Badge } from '@mantine/core';
import { IconReceipt } from '@tabler/icons-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import classes from '../pages/LandingPage.module.css';

interface FooterLink {
  key: string;
  href: string;
}

const PRODUCT_LINKS: readonly FooterLink[] = [
  { key: 'ledger', href: '#preview' },
  { key: 'sync', href: '#preview' },
  { key: 'reconciliation', href: '#preview' },
  { key: 'openingBalance', href: '#preview' },
  { key: 'reports', href: '#preview' },
];

const RESOURCE_LINKS: readonly FooterLink[] = [
  { key: 'playbook', href: '#ebooks' },
  { key: 'dictionary', href: '#ebooks' },
  { key: 'reconciliation', href: '#ebooks' },
  { key: 'comparison', href: '#comparison' },
  { key: 'help', href: '#faq' },
];

const ACCESS_LINKS: readonly FooterLink[] = [
  { key: 'login', href: routes.login },
  { key: 'iso', href: '#top' },
  { key: 'privacy', href: '#top' },
  { key: 'terms', href: '#top' },
];

export function LandingFooter() {
  const { t } = useTranslation('landing');

  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.footerGrid}>
          <div>
            <a href="#top" className={classes.brand}>
              <span className={classes.brandMark}>
                <IconReceipt size={20} stroke={2.2} />
              </span>
              <span>{t('brandName')}</span>
            </a>
            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--lp-muted)',
                maxWidth: 320,
              }}
            >
              {t('footer.tagline')}
            </p>
            <div style={{ marginTop: 16 }}>
              <Badge size="sm" variant="dot" color="teal">
                {t('footer.status')}
              </Badge>
            </div>
          </div>

          <div>
            <div className={classes.footerTitle}>{t('footer.productsTitle')}</div>
            {PRODUCT_LINKS.map((link) => (
              <a key={link.key} href={link.href} className={classes.footerLink}>
                {t(`footer.products.${link.key}`)}
              </a>
            ))}
          </div>

          <div>
            <div className={classes.footerTitle}>{t('footer.resourcesTitle')}</div>
            {RESOURCE_LINKS.map((link) => (
              <a key={link.key} href={link.href} className={classes.footerLink}>
                {t(`footer.resources.${link.key}`)}
              </a>
            ))}
          </div>

          <div>
            <div className={classes.footerTitle}>{t('footer.accessTitle')}</div>
            {ACCESS_LINKS.map((link) => (
              <a key={link.key} href={link.href} className={classes.footerLink}>
                {t(`footer.access.${link.key}`)}
              </a>
            ))}
            <div style={{ marginTop: 14 }}>
              <LanguageSwitcher variant="compact" />
            </div>
          </div>
        </div>

        <div className={classes.footerBottom}>
          <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <span>{t('footer.madeWith')}</span>
        </div>
      </div>
    </footer>
  );
}
