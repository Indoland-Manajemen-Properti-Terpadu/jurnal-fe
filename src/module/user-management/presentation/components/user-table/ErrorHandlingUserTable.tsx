import { ErrorAlert } from '@/components';
import { Center, Loader } from '@mantine/core';

import { useTranslation } from '@/i18n';

type LoadingErrorStateProps = {
  isLoading?: boolean;
  isError?: boolean;
};

const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({ isLoading, isError }) => {
  const { t: tu } = useTranslation('userManagement');
  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError) {
    return <ErrorAlert title={tu('user.errorTitle')} message={tu('user.errorMessage')} />;
  }
  return null;
};

export default LoadingErrorState;
