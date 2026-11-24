import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { describeApiError } from '@/lib/http/apiError';
import {
  COMPANY_MENU,
  type CompanyForm,
  type CompanyProfile,
} from '@/module/settings/domain/companyProfile';
import {
  fetchCompanyProfile,
  removeCompanyLogo,
  saveCompanyProfile,
  uploadCompanyLogo,
} from '@/module/settings/infrastructure/companyProfileApi';
import { fetchMenuRights, type MenuRights } from '@/module/settings/infrastructure/myRightsApi';
import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

export const useCompanyProfile = () =>
  useQuery({ queryKey: settingKeys.company(), queryFn: fetchCompanyProfile });

const NO_RIGHTS: MenuRights = { create: false, read: false, update: false, delete: false };

/** What the signed-in person may do with the company profile; nothing is offered until it is known. */
export const useCompanyRights = (): MenuRights => {
  const { data } = useQuery({
    queryKey: [...settingKeys.all, 'rights', COMPANY_MENU],
    queryFn: () => fetchMenuRights(COMPANY_MENU),
    staleTime: 60_000,
  });
  return data ?? NO_RIGHTS;
};

/** A safe sentence for a failed call (the service's Indonesian refusal for Indonesian readers). */
export const useCompanyErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('settings');
  return (error: unknown) =>
    describeApiError(error, currentLanguage, {
      rejected: t('company.errors.rejected'),
      forbidden: t('company.errors.forbidden'),
      validation: t('company.errors.validation'),
      unauthorized: t('company.errors.unauthorized'),
      notFound: t('company.errors.notFound'),
      network: t('company.errors.network'),
      generic: t('company.errors.generic'),
    });
};

/**
 * Every write answers with the whole profile, which replaces what the page holds, so the logo and the
 * text always show what the service kept.
 */
export const useCompanyMutations = () => {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const describe = useCompanyErrorMessage();
  const done = (message: string) => (profile: CompanyProfile) => {
    queryClient.setQueryData(settingKeys.company(), profile);
    notifications.show({ color: 'teal', message });
  };
  const failed = (error: unknown) =>
    notifications.show({ color: 'orange', autoClose: 7000, message: describe(error) });

  return {
    save: useMutation({
      mutationFn: (form: CompanyForm) => saveCompanyProfile(form),
      onSuccess: done(t('company.notify.saved')),
      onError: failed,
    }),
    uploadLogo: useMutation({
      mutationFn: (file: File) => uploadCompanyLogo(file),
      onSuccess: done(t('company.notify.logoSaved')),
      onError: failed,
    }),
    removeLogo: useMutation({
      mutationFn: () => removeCompanyLogo(),
      onSuccess: done(t('company.notify.logoRemoved')),
      onError: failed,
    }),
  };
};
