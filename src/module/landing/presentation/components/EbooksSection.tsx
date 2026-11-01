import { Badge, Button } from '@mantine/core';
import { IconBook2, IconCheck, IconDownload } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import { EBOOK_HIGHLIGHT_KEYS, EBOOKS } from './ebookData';
import type { EbookItem } from './ebookData';
import { SectionHead } from './SectionHead';

interface EbooksSectionProps {
  onOpenEbook: (ebook: EbookItem) => void;
}

export function EbooksSection({ onOpenEbook }: EbooksSectionProps) {
  const { t } = useTranslation('landing');

  return (
    <section id="ebooks" className={classes.sectionAlt}>
      <div className={classes.container}>
        <SectionHead
          kicker={t('ebooks.kicker')}
          title={t('ebooks.title')}
          subtitle={t('ebooks.subtitle')}
        />

        <div className={classes.ebookGrid}>
          {EBOOKS.map((book) => {
            const title = t(`ebooks.items.${book.id}.title`);
            return (
              <div key={book.id} className={classes.ebookCard}>
                <div className={classes.ebookCover} style={{ background: book.gradient }}>
                  <div className={classes.ebookTag}>{t(`ebooks.items.${book.id}.tag`)}</div>
                  <div>
                    <IconBook2 size={32} stroke={1.5} style={{ opacity: 0.9 }} />
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 'var(--jurnal-text-md)',
                        marginTop: 8,
                        lineHeight: 1.25,
                      }}
                    >
                      {title}
                    </div>
                  </div>
                </div>

                <div className={classes.ebookTitle}>{title}</div>
                <p className={classes.ebookDesc}>{t(`ebooks.items.${book.id}.desc`)}</p>

                <div
                  style={{
                    margin: '14px 0',
                    display: 'grid',
                    gap: 6,
                    fontSize: 'var(--jurnal-text-xs)',
                    color: 'var(--mantine-color-slate-6)',
                  }}
                >
                  {EBOOK_HIGHLIGHT_KEYS.map((key) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconCheck
                        size={14}
                        color="var(--mantine-color-emerald-6)"
                        stroke={2.5}
                        style={{ flexShrink: 0 }}
                      />
                      <span>{t(`ebooks.items.${book.id}.highlights.${key}`)}</span>
                    </div>
                  ))}
                </div>

                <div className={classes.ebookMeta}>
                  <span>
                    {t('ebooks.meta', {
                      pages: t('ebooks.pagesLabel', { count: book.pages }),
                      readTime: t('ebooks.readTimeLabel', { count: book.readMinutes }),
                    })}
                  </span>
                  <Badge size="xs" color="teal" variant="light">
                    {t('ebooks.pdfBadge')}
                  </Badge>
                </div>

                <Button
                  mt="md"
                  color="primary"
                  variant="light"
                  radius="md"
                  fullWidth
                  leftSection={<IconDownload size={16} />}
                  onClick={() => onOpenEbook(book)}
                >
                  {t('ebooks.download')}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
