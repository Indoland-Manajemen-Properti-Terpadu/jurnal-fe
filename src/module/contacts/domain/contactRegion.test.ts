import { describe, expect, it } from 'vitest';
import {
  buildCityOptions,
  buildProvinceOptions,
  resolveCityChange,
  resolveProvinceChange,
} from './contactRegion';

describe('contactRegion', () => {
  it('keeps an unknown saved province or city selectable at the top', () => {
    expect(buildProvinceOptions('Atlantis')[0]).toEqual({ value: 'Atlantis', label: 'Atlantis' });
    expect(buildProvinceOptions('Atlantis')).toHaveLength(
      buildProvinceOptions('DKI Jakarta').length + 1
    );
    expect(buildCityOptions('DKI Jakarta', 'Gotham')[0].value).toBe('Gotham');
    expect(buildCityOptions('DKI Jakarta', 'Jakarta Pusat')[0].value).toBe('Jakarta Pusat');
  });

  it('lists every city when no province is chosen', () => {
    expect(buildCityOptions('', '').length).toBeGreaterThan(
      buildCityOptions('DKI Jakarta', '').length
    );
  });

  it('clears a city that is outside the new province', () => {
    expect(resolveProvinceChange('DKI Jakarta', 'Kota Bandung')).toEqual({
      province: 'DKI Jakarta',
      city: '',
    });
    expect(resolveProvinceChange('DKI Jakarta', 'Jakarta Pusat').city).toBe('Jakarta Pusat');
    expect(resolveProvinceChange(null, 'Kota Bandung')).toEqual({
      province: '',
      city: 'Kota Bandung',
    });
  });

  it('fills the province from the city only when none is set', () => {
    expect(resolveCityChange('Jakarta Pusat', '')).toEqual({
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
    });
    expect(resolveCityChange('Jakarta Pusat', 'Jawa Barat').province).toBe('Jawa Barat');
    expect(resolveCityChange(null, 'Jawa Barat')).toEqual({ city: '', province: 'Jawa Barat' });
  });
});
