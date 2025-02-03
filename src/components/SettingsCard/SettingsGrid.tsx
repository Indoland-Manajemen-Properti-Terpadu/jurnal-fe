import { PaperProps, SimpleGrid, Skeleton } from '@mantine/core';
import SettingsCard from '@/components/SettingsCard/SettingsCard';
import classes from './SettingsGrid.module.css';
import { ReactNode } from 'react';
import { ErrorAlert, Surface } from '@/components';

type SettingsGridProps = {
  data?: { type: string; title: string; description: string; icon: string }[];
  paperProps?: PaperProps;
  error?: ReactNode;
  loading?: boolean;
};

export default function SettingsGrid({ data, loading, error, paperProps }: SettingsGridProps) {
  const stats = data?.map((stat) => <SettingsCard key={stat.title} data={stat} {...paperProps} />);

  return (
    <div className={classes.root}>
      {error ? (
        <ErrorAlert title="Error loading stats" message={error.toString()} />
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 10, sm: 'md' }}
          verticalSpacing={{ base: 'md', sm: 'md' }}
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
