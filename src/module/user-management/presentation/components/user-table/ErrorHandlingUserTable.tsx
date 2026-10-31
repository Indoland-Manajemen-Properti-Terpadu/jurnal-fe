import { ErrorAlert } from '@/components';
import { Center, Loader } from '@mantine/core';

type LoadingErrorStateProps = {
  isLoading?: boolean;
  isError?: boolean;
};

const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({ isLoading, isError }) => {
  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError) {
    return (
      <ErrorAlert title="Error loading users" message="An error occurred while loading the data" />
    );
  }
  return null;
};

export default LoadingErrorState;
