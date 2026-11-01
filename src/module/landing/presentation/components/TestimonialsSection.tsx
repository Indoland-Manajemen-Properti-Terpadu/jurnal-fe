import { Rating } from '@mantine/core';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import { ComplianceBadges } from './ComplianceBadges';
import { SectionHead } from './SectionHead';

const TESTIMONIALS = [
  { id: 'hendrik', rating: 5, avatar: 'HW' },
  { id: 'jessica', rating: 5, avatar: 'JC' },
  { id: 'bambang', rating: 5, avatar: 'BS' },
] as const;

export function TestimonialsSection() {
  const { t } = useTranslation('landing');

  return (
    <section id="testimonials" className={classes.section}>
      <div className={classes.container}>
        <SectionHead
          kicker={t('testimonials.kicker')}
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
        />

        <div className={classes.testimonialGrid}>
          {TESTIMONIALS.map((item) => (
            <div key={item.id} className={classes.testimonialCard}>
              <div className={classes.testimonialStars}>
                <Rating value={item.rating} readOnly size="sm" color="yellow" />
              </div>
              <p className={classes.testimonialQuote}>
                {`"${t(`testimonials.items.${item.id}.quote`)}"`}
              </p>
              <div className={classes.testimonialAuthor}>
                <div className={classes.authorAvatar}>{item.avatar}</div>
                <div>
                  <div className={classes.authorName}>
                    {t(`testimonials.items.${item.id}.name`)}
                  </div>
                  <div className={classes.authorTitle}>
                    {t(`testimonials.items.${item.id}.title`)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ComplianceBadges />
      </div>
    </section>
  );
}
