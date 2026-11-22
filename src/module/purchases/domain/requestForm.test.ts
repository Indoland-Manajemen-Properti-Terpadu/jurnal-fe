import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import {
  emptyRequestForm,
  hasRequestErrors,
  MIN_QUANTITY,
  REQUEST_LIMITS,
  requestToForm,
  toRequestInput,
  validateRequestForm,
  type RequestFormValues,
} from '@/module/purchases/domain/requestForm';

/** A form that passes every rule; each test breaks one thing. */
const validForm = (): RequestFormValues => {
  const form = emptyRequestForm('2026-11-05');
  form.requiredDate = '2026-12-01';
  form.departmentId = 'dept1';
  form.purpose = 'ATK bulanan';
  form.items[0].description = 'Kertas A4';
  return form;
};

describe('validateRequestForm', () => {
  it('accepts a complete request', () => {
    expect(hasRequestErrors(validateRequestForm(validForm()))).toBe(false);
  });

  it('requires the department, the purpose, the required date and the request date', () => {
    const form = validForm();
    form.departmentId = '';
    form.purpose = '   ';
    form.requiredDate = '';
    form.transactionDate = '';

    const errors = validateRequestForm(form);

    expect(errors).toMatchObject({
      department: 'required',
      purpose: 'required',
      requiredDate: 'required',
      transactionDate: 'required',
    });
  });

  it('rejects a required date before the request date but accepts the same day', () => {
    const form = validForm();
    form.requiredDate = '2026-11-01';
    expect(validateRequestForm(form).requiredDate).toBe('beforeDate');

    form.requiredDate = '2026-11-05';
    expect(validateRequestForm(form).requiredDate).toBeUndefined();
  });

  it('requires a description when no product is picked', () => {
    const form = validForm();
    form.items[0].description = '  ';
    expect(validateRequestForm(form).itemRows[form.items[0].key]).toEqual({
      description: 'required',
    });

    form.items[0].productId = 'p1';
    expect(hasRequestErrors(validateRequestForm(form))).toBe(false);
  });

  it.each([0, -1, 0.001, ''])('refuses the quantity %j', (quantity) => {
    const form = validForm();
    form.items[0].quantity = quantity as number | '';
    expect(validateRequestForm(form).itemRows[form.items[0].key]).toEqual({ quantity: 'min' });
  });

  it('accepts the smallest quantity and a fraction', () => {
    const form = validForm();
    form.items[0].quantity = MIN_QUANTITY;
    expect(hasRequestErrors(validateRequestForm(form))).toBe(false);
    form.items[0].quantity = 2.5;
    expect(hasRequestErrors(validateRequestForm(form))).toBe(false);
  });

  it('accepts the longest texts the service takes and refuses one character more', () => {
    const form = validForm();
    form.purpose = 'p'.repeat(REQUEST_LIMITS.purpose);
    form.memo = 'm'.repeat(REQUEST_LIMITS.memo);
    form.iomNumber = 'i'.repeat(REQUEST_LIMITS.iomNumber);
    form.items[0].description = 'd'.repeat(REQUEST_LIMITS.description);
    form.items[0].specification = 's'.repeat(REQUEST_LIMITS.specification);
    expect(hasRequestErrors(validateRequestForm(form))).toBe(false);

    form.purpose += 'p';
    form.memo += 'm';
    form.iomNumber += 'i';
    form.items[0].description += 'd';
    form.items[0].specification += 's';
    const errors = validateRequestForm(form);

    expect(errors).toMatchObject({ purpose: 'tooLong', memo: 'tooLong', iomNumber: 'tooLong' });
    expect(errors.itemRows[form.items[0].key]).toEqual({
      description: 'tooLong',
      specification: 'tooLong',
    });
  });

  it('needs at least one line', () => {
    const form = validForm();
    form.items = [];
    expect(validateRequestForm(form).items).toBe('empty');
  });
});

describe('toRequestInput', () => {
  it('sends every field trimmed, so a PUT clears what the person emptied', () => {
    const form = validForm();
    form.purpose = '  ATK ';
    form.memo = '';
    form.iomNumber = ' IOM/1 ';
    form.iomDate = '';
    form.items[0] = {
      ...form.items[0],
      kind: 'SERVICE',
      productId: 'p1',
      unitId: 'u1',
      description: ' Kertas ',
      specification: ' 80 gsm ',
      quantity: 3,
    };

    expect(toRequestInput(form)).toEqual({
      transactionDate: '2026-11-05',
      requiredDate: '2026-12-01',
      department: 'dept1',
      purpose: 'ATK',
      iom: { number: 'IOM/1', date: null },
      memo: '',
      items: [
        {
          product: 'p1',
          kind: 'SERVICE',
          description: 'Kertas',
          specification: '80 gsm',
          quantity: 3,
          unit: 'u1',
        },
      ],
    });
  });

  it('leaves out the product and the unit of a line that has none', () => {
    const [item] = toRequestInput(validForm()).items;

    expect(item).not.toHaveProperty('product');
    expect(item).not.toHaveProperty('unit');
  });
});

describe('requestToForm', () => {
  it('turns a stored request back into the form it was made with', () => {
    const doc = {
      date: '2026-11-05',
      requiredDate: '2026-12-01',
      department: { id: 'dept1', name: 'Engineering' },
      purpose: 'ATK',
      iom: { number: 'IOM/1', date: '2026-11-01', attachments: [] },
      memo: 'cat',
      items: [
        {
          id: 'i1',
          kind: 'GOODS',
          product: { id: 'p1', name: 'Kertas' },
          description: 'A4',
          specification: '80 gsm',
          quantity: 5,
          unit: { id: 'u1', name: 'rim' },
        },
      ],
    } as unknown as PurchaseRequest;

    const form = requestToForm(doc);

    expect(form).toMatchObject({
      transactionDate: '2026-11-05',
      requiredDate: '2026-12-01',
      departmentId: 'dept1',
      purpose: 'ATK',
      iomNumber: 'IOM/1',
      iomDate: '2026-11-01',
      memo: 'cat',
    });
    expect(form.items[0]).toMatchObject({
      kind: 'GOODS',
      productId: 'p1',
      productName: 'Kertas',
      unitId: 'u1',
      description: 'A4',
      specification: '80 gsm',
      quantity: 5,
    });
  });
});
