import {
  ALL_INDONESIA_CITIES,
  INDONESIA_PROVINCES,
  findProvinceByCity,
  getCitiesByProvince,
} from '@/constants/regionsIndonesia';

export type SelectOption = { value: string; label: string };

const toOptions = (values: string[]): SelectOption[] =>
  values.map((value) => ({ value, label: value }));

/** Province options; a saved province that is not in the master list stays selectable. */
export const buildProvinceOptions = (province: string): SelectOption[] => {
  const list = toOptions(INDONESIA_PROVINCES);
  if (province && !INDONESIA_PROVINCES.includes(province)) {
    return [{ value: province, label: province }, ...list];
  }
  return list;
};

/** City options for the chosen province (all cities when none); a saved unknown city is kept. */
export const buildCityOptions = (province: string, city: string): SelectOption[] => {
  const cities = province ? getCitiesByProvince(province) : ALL_INDONESIA_CITIES;
  const list = toOptions(cities);
  if (city && !cities.includes(city)) {
    return [{ value: city, label: city }, ...list];
  }
  return list;
};

/** Changing the province clears a city that does not belong to it. */
export const resolveProvinceChange = (
  value: string | null,
  currentCity: string
): { province: string; city: string } => {
  const province = value || '';
  if (province && currentCity && !getCitiesByProvince(province).includes(currentCity)) {
    return { province, city: '' };
  }
  return { province, city: currentCity };
};

/** Picking a city while no province is set fills in the province that owns the city. */
export const resolveCityChange = (
  value: string | null,
  currentProvince: string
): { city: string; province: string } => {
  const city = value || '';
  if (city && !currentProvince) {
    return { city, province: findProvinceByCity(city) ?? currentProvince };
  }
  return { city, province: currentProvince };
};
