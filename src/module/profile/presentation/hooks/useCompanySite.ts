import { useGetProfile } from '@/module/profile/presentation/hooks/useProfileQueries';

/** The site (company) of the signed-in user: its name and the code the site is known by. */
export const useCompanySite = () => {
  const { data, isLoading } = useGetProfile();
  return { site: data?.site, isLoading };
};
