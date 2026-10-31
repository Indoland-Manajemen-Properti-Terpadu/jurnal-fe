import {
  buildTaxPayload,
  DEFAULT_TAX_RATE,
  previewNumber,
  validateAdminFee,
  validateFeeAccount,
  validateNumberFormatPrefix,
  validatePaymentMethodName,
  validatePaymentTermDays,
  validatePaymentTermName,
  validateStartNumber,
  validateTagName,
  validateTaxName,
  validateTaxRate,
} from './settingRules';

describe('name validators', () => {
  it.each([
    [validateTaxName, 'validation.taxNameRequired'],
    [validatePaymentTermName, 'validation.paymentTermNameRequired'],
    [validatePaymentMethodName, 'validation.paymentMethodNameRequired'],
    [validateTagName, 'validation.tagNameRequired'],
    [validateNumberFormatPrefix, 'validation.prefixRequired'],
  ])('rejects a blank value with its key', (validate, key) => {
    expect(validate('')).toBe(key);
    expect(validate('   ')).toBe(key);
    expect(validate('PPN')).toBeNull();
  });
});

describe('numeric validators', () => {
  it('accepts a zero or positive tax rate and rejects negative or missing ones', () => {
    expect(validateTaxRate(0)).toBeNull();
    expect(validateTaxRate(11)).toBeNull();
    expect(validateTaxRate(-0.1)).toBe('validation.taxRateMin');
    expect(validateTaxRate(undefined)).toBe('validation.taxRateMin');
  });

  it('accepts zero or more due days and an admin fee, rejects negatives', () => {
    expect(validatePaymentTermDays(0)).toBeNull();
    expect(validatePaymentTermDays(-1)).toBe('validation.paymentTermDaysMin');
    expect(validateAdminFee(0)).toBeNull();
    expect(validateAdminFee(-5)).toBe('validation.adminFeeMin');
  });

  it('needs a start number of at least 1', () => {
    expect(validateStartNumber(1)).toBeNull();
    expect(validateStartNumber(0)).toBe('validation.startNumberMin');
    expect(validateStartNumber(undefined)).toBe('validation.startNumberMin');
  });
});

describe('validateFeeAccount', () => {
  it('requires a fee account only when an admin fee is charged', () => {
    expect(validateFeeAccount(1500, null)).toBe('validation.feeAccountRequired');
    expect(validateFeeAccount(0.01, '')).toBe('validation.feeAccountRequired');
    expect(validateFeeAccount(1500, 'acc-1')).toBeNull();
    expect(validateFeeAccount(0, null)).toBeNull();
    expect(validateFeeAccount(undefined, null)).toBeNull();
  });
});

describe('previewNumber', () => {
  it('pads the number to six digits and joins prefix and suffix with a slash', () => {
    expect(previewNumber('PRO/INV', 1, '')).toBe('PRO/INV/000001');
    expect(previewNumber('JV', 42, '2026')).toBe('JV/000042/2026');
  });

  it('leaves out the slash of an empty prefix or suffix', () => {
    expect(previewNumber('', 42, '')).toBe('000042');
  });

  it('keeps a number that is already longer than six digits', () => {
    expect(previewNumber('INV', 1234567, '')).toBe('INV/1234567');
  });
});

describe('buildTaxPayload', () => {
  it('sends empty accounts as undefined and keeps the rate', () => {
    expect(
      buildTaxPayload({
        name: 'PPN',
        rate: DEFAULT_TAX_RATE,
        salesAccount: '',
        purchaseAccount: '',
      })
    ).toEqual({ name: 'PPN', rate: 11, salesAccount: undefined, purchaseAccount: undefined });
  });

  it('keeps chosen accounts', () => {
    expect(
      buildTaxPayload({ name: 'PPN', rate: 11, salesAccount: 's1', purchaseAccount: 'p1' })
    ).toEqual({ name: 'PPN', rate: 11, salesAccount: 's1', purchaseAccount: 'p1' });
  });
});
