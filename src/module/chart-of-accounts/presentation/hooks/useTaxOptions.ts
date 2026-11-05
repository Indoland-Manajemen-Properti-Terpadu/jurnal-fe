import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaxOptions } from '../../infrastructure/taxOptionApi';

/** Select options for the default tax of an account; the value is the tax id. */
export const useTaxOptions = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['account_tax_options'],
    queryFn: fetchTaxOptions,
  });
  const options = useMemo(
    () => (data ?? []).map((tax) => ({ value: tax.id, label: tax.name })),
    [data]
  );
  return { options, isLoading };
};
