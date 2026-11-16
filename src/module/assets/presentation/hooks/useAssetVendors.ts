import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { fetchContacts } from '@/module/contacts';
import { assetKeys } from '@/module/assets/presentation/hooks/useAssetQueries';

const VENDOR_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
// The API caches the contact list for a minute, so a fresh fetch gains little sooner.
const VENDOR_STALE_MS = 60 * 1000;

/** Supplier contacts that match what the person typed, for the vendor picker. */
export const useVendorContacts = (search: string, enabled: boolean) => {
  const [debounced] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  return useQuery({
    queryKey: assetKeys.vendors(debounced),
    queryFn: () =>
      fetchContacts({
        page: 1,
        limit: VENDOR_PAGE_SIZE,
        contactType: 'Supplier',
        search: debounced,
      }),
    staleTime: VENDOR_STALE_MS,
    enabled,
    select: (page) => page.items,
  });
};
