import { Text } from '@mantine/core';
import { IconFileDescription } from '@tabler/icons-react';
import { DetailCardHeader } from '@/components/DetailCardHeader/DetailCardHeader';
import { useTranslation } from '@/i18n';
import {
  addressLine,
  companyInitials,
  taxPhoneLine,
  type CompanyForm,
} from '@/module/settings/domain/companyProfile';
import classes from './CompanyLetterhead.module.css';

interface CompanyLetterheadProps {
  /** What is typed right now, so the preview follows every keystroke. */
  form: CompanyForm;
  logoUrl: string | null;
}

/** The header of a purchasing document as it prints: the logo (or the initials box), the name, the address, the tax and phone line. */
export const CompanyLetterhead = ({ form, logoUrl }: Readonly<CompanyLetterheadProps>) => {
  const { t } = useTranslation('settings');
  const address = addressLine(form);
  const taxPhone = taxPhoneLine(form, {
    npwp: t('company.preview.npwp'),
    phone: t('company.preview.phone'),
  });
  const name = form.name.trim();

  return (
    <div>
      <DetailCardHeader
        icon={<IconFileDescription size={18} stroke={1.8} />}
        title={t('company.preview.title')}
        subtitle={t('company.preview.subtitle')}
      />
      <div className={classes.well}>
        <Text size="xs" c="dimmed" mb="xs" fw={600} tt="uppercase">
          {t('company.preview.sample')}
        </Text>
        <div className={classes.sheet}>
          <div className={classes.head}>
            <div className={`${classes.logo} ${logoUrl ? '' : classes.initials}`}>
              {logoUrl ? (
                <img
                  className={classes.logoImage}
                  src={logoUrl}
                  alt={t('company.logo.alt', { name })}
                />
              ) : (
                <span aria-hidden="true">{companyInitials(name)}</span>
              )}
            </div>
            <div>
              <div className={`${classes.name} ${name ? '' : classes.namePlaceholder}`}>
                {name || t('company.field.name')}
              </div>
              {address && <div className={classes.detail}>{address}</div>}
              {taxPhone && <div className={classes.detail}>{taxPhone}</div>}
            </div>
          </div>
          <div className={classes.rule} />
          <div className={classes.lines} aria-hidden="true">
            <div className={classes.line} />
            <div className={classes.line} />
            <div className={classes.line} />
          </div>
        </div>
      </div>
    </div>
  );
};
