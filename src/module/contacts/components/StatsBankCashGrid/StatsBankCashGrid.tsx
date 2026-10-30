import { PaperProps, SimpleGrid, Skeleton } from '@mantine/core';
import classes from './StatsGrid.module.css';
import { ReactNode } from 'react';
import { ErrorAlert } from '@/components';
import StatsBankCashCard from '../StatsBankCashCard/StatsBankCashCard';
import StatsContactCard from '../StatsBankCashCard/StatsBankCashCard';

type StatsContactGridProps = {
  data?: { title: string; value: string; amount: number; diff: number; period?: string }[];
  paperProps?: PaperProps;
  error?: ReactNode;
  loading?: boolean;
};

export default function StatsContactGrid({ data, loading, error, paperProps }: StatsContactGridProps) {
  const stats = data?.map((stat) => <StatsContactCard key={stat.title} data={stat} {...paperProps} />);

  return (
    <div className={classes.root}>
      {error ? (
        <ErrorAlert title="Error loading stats" message={error.toString()} />
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 3, lg: 3 }}
          spacing={{ base: 5, sm: 'sm' }}
          verticalSpacing={{ base: 5, sm: 'sm' }}
        // pt='md'
        >
          {loading
            ? Array.from({ length: 4 }).map((o, i) => (
              <Skeleton key={`stats-loading-${i}`} visible={true} height={200} />
            ))
            : stats}
        </SimpleGrid>
      )}
    </div>
  );
}
