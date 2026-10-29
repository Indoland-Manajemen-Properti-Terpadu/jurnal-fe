import { useState, useCallback, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';
import {
  calculateAssetDepreciation,
  loadStoredAssets,
  persistAssets,
} from '@/module/assets/infrastructure/assetStorage';

export const useAssets = () => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAssets = useCallback(() => {
    setIsLoading(true);
    try {
      const data = loadStoredAssets();
      setAssets(data);
    } catch (err) {
      console.error('[useAssets] Error loading assets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const saveAsset = useCallback((values: AssetFormValues): boolean => {
    try {
      const { accumulatedDepreciation, netBookValue } = calculateAssetDepreciation(
        Number(values.acquisitionCost),
        Number(values.residualValue),
        Number(values.usefulLifeYears),
        values.depreciationMethod,
        values.acquisitionDate
      );

      const isFullyDep =
        values.depreciationMethod !== 'none' && netBookValue <= Number(values.residualValue);

      setAssets((prev) => {
        let updated: AssetItem[];
        if (values.id) {
          // Update
          updated = prev.map((item) =>
            item.id === values.id
              ? {
                  ...item,
                  code: values.code,
                  name: values.name,
                  category: values.category,
                  acquisitionDate: values.acquisitionDate,
                  acquisitionCost: Number(values.acquisitionCost),
                  residualValue: Number(values.residualValue),
                  usefulLifeYears: Number(values.usefulLifeYears),
                  depreciationMethod: values.depreciationMethod,
                  notes: values.notes,
                  accumulatedDepreciation,
                  netBookValue,
                  status: isFullyDep
                    ? 'fully_depreciated'
                    : item.status === 'disposed'
                      ? 'disposed'
                      : 'active',
                }
              : item
          );
        } else {
          // Create
          const newAsset: AssetItem = {
            id: `asset-${Date.now()}`,
            code: values.code,
            name: values.name,
            category: values.category,
            acquisitionDate: values.acquisitionDate,
            acquisitionCost: Number(values.acquisitionCost),
            residualValue: Number(values.residualValue),
            usefulLifeYears: Number(values.usefulLifeYears),
            depreciationMethod: values.depreciationMethod,
            notes: values.notes,
            accumulatedDepreciation,
            netBookValue,
            status: isFullyDep ? 'fully_depreciated' : 'active',
          };
          updated = [newAsset, ...prev];
        }

        persistAssets(updated);
        return updated;
      });

      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: values.id
          ? `Data aset ${values.name} berhasil diperbarui.`
          : `Aset ${values.name} berhasil ditambahkan ke daftar aktiva tetap.`,
      });

      return true;
    } catch (err: any) {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: err?.message || 'Terjadi kesalahan saat menyimpan data aset.',
      });
      return false;
    }
  }, []);

  const deleteAsset = useCallback((id: string, name: string) => {
    try {
      setAssets((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        persistAssets(updated);
        return updated;
      });

      notifications.show({
        color: 'teal',
        title: 'Aset Dihapus',
        message: `Aset ${name} berhasil dihapus dari sistem.`,
      });
    } catch (err: any) {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: err?.message || 'Gagal menghapus aset.',
      });
    }
  }, []);

  const disposeAsset = useCallback(
    (id: string, disposalDate: string, disposalPrice: number): boolean => {
      try {
        setAssets((prev) => {
          const updated = prev.map((item) => {
            if (item.id !== id) return item;
            const gainLoss = Number(disposalPrice) - item.netBookValue;
            return {
              ...item,
              status: 'disposed' as const,
              disposalDate,
              disposalPrice: Number(disposalPrice),
              disposalGainLoss: gainLoss,
            };
          });
          persistAssets(updated);
          return updated;
        });

        notifications.show({
          color: 'teal',
          title: 'Pelepasan Aset Berhasil',
          message: 'Status aset berhasil diubah menjadi dilepas / dijual.',
        });

        return true;
      } catch (err: any) {
        notifications.show({
          color: 'red',
          title: 'Gagal',
          message: err?.message || 'Gagal memproses pelepasan aset.',
        });
        return false;
      }
    },
    []
  );

  const getAssetById = useCallback(
    (id: string): AssetItem | undefined => {
      return assets.find((a) => a.id === id);
    },
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
