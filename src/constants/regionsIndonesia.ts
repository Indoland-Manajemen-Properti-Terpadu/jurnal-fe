/**
 * Master Data Wilayah Administratif Indonesia (38 Provinsi & Kota/Kabupaten)
 * Terstandarisasi berdasarkan data Kemendagri & BPS Republik Indonesia.
 */

import { REGIONS_PART_ONE } from './regionsIndonesiaWest';
import { REGIONS_PART_TWO } from './regionsIndonesiaEast';

export const REGIONS_BY_PROVINCE: Record<string, string[]> = {
  ...REGIONS_PART_ONE,
  ...REGIONS_PART_TWO,
};

/**
 * Daftar semua 38 provinsi di Indonesia (terurut alfabetis)
 */
export const INDONESIA_PROVINCES: string[] = Object.keys(REGIONS_BY_PROVINCE);

/**
 * Mendapatkan daftar kota/kabupaten berdasarkan nama provinsi
 */
export const getCitiesByProvince = (provinceName?: string | null): string[] => {
  if (!provinceName) return [];
  return REGIONS_BY_PROVINCE[provinceName] || [];
};

/**
 * Mencari nama provinsi berdasarkan nama kota/kabupaten
 */
export const findProvinceByCity = (cityName?: string | null): string | null => {
  if (!cityName) return null;
  const cleanCity = cityName.trim().toLowerCase();

  for (const [province, cities] of Object.entries(REGIONS_BY_PROVINCE)) {
    const matched = cities.some((c) => c.toLowerCase() === cleanCity);
    if (matched) return province;
  }
  return null;
};

/**
 * Daftar flat semua kota/kabupaten di Indonesia
 */
export const ALL_INDONESIA_CITIES: string[] = Object.values(REGIONS_BY_PROVINCE).flat();
