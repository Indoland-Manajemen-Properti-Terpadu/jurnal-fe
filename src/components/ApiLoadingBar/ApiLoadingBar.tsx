import { Progress } from '@mantine/core';
import { useApiLoadingStore } from '@/store/useApiLoading';
import { layers, themeColors } from '@/theme';

export function ApiLoadingBar() {
  const pendingRequests = useApiLoadingStore((state) => state.pendingRequests);

  if (pendingRequests === 0) {
    return null;
  }

  return (
    <Progress
      animated
      color={themeColors.primary[5]}
      radius={0}
      size="xs"
      value={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: layers.max,
      }}
    />
  );
}
