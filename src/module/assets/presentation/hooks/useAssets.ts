import { useState, useCallback, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';
import { createAsset, disposeAssetItem, updateAsset } from '@/module/assets/domain/assetMutations';
import { localStorageAssetRepository } from '@/module/assets/infrastructure/localStorageAssetRepository';

const repository = localStorageAssetRepository;

const tr = (key: string, params?: Record<string, string | number>) => t(key, params, 'assets');

const errorMessage = (error: unknown, fallbackKey: string): string =>
  (error instanceof Error && error.message) || tr(fallbackKey);

export const useAssets = () => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAssets = useCallback(() => {
    setIsLoading(true);
    try {
      setAssets(repository.load());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const saveAsset = useCallback((values: AssetFormValues): boolean => {
    try {
      setAssets((prev) => {
        const updated = values.id
          ? prev.map((item) => (item.id === values.id ? updateAsset(item, values) : item))
          : [createAsset(values, `asset-${Date.now()}`), ...prev];
        repository.save(updated);
        return updated;
      });

      notifications.show({
        color: 'teal',
        title: tr('notifySuccessTitle'),
        message: values.id
          ? tr('notifyAssetUpdated', { name: values.name })
          : tr('notifyAssetAdded', { name: values.name }),
      });

      return true;
    } catch (err: unknown) {
      notifications.show({
        color: 'red',
        title: tr('notifyErrorTitle'),
        message: errorMessage(err, 'notifySaveFailed'),
      });
      return false;
    }
  }, []);

  const deleteAsset = useCallback((id: string, name: string) => {
    try {
      setAssets((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        repository.save(updated);
        return updated;
      });

      notifications.show({
        color: 'teal',
        title: tr('notifyAssetDeletedTitle'),
        message: tr('notifyAssetDeleted', { name }),
      });
    } catch (err: unknown) {
      notifications.show({
        color: 'red',
        title: tr('notifyErrorTitle'),
        message: errorMessage(err, 'notifyDeleteFailed'),
      });
    }
  }, []);

  const disposeAsset = useCallback(
    (id: string, disposalDate: string, disposalPrice: number): boolean => {
      try {
        setAssets((prev) => {
          const updated = prev.map((item) =>
            item.id === id ? disposeAssetItem(item, disposalDate, disposalPrice) : item
          );
          repository.save(updated);
          return updated;
        });

        notifications.show({
          color: 'teal',
          title: tr('notifyDisposedTitle'),
          message: tr('notifyDisposed'),
        });

        return true;
      } catch (err: unknown) {
        notifications.show({
          color: 'red',
          title: tr('notifyErrorTitle'),
          message: errorMessage(err, 'notifyDisposeFailed'),
        });
        return false;
      }
    },
    []
  );

  const getAssetById = useCallback(
    (id: string): AssetItem | undefined => assets.find((a) => a.id === id),
    [assets]
  );

  return {
    assets,
    isLoading,
    refetch: fetchAssets,
    getAssetById,
    saveAsset,
    deleteAsset,
    disposeAsset,
  };
};

export default useAssets;
