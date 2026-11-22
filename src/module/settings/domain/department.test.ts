import { describe, expect, it } from 'vitest';
import {
  DEPARTMENT_LIMITS,
  emptyDepartmentInput,
  toDepartmentInput,
  toDepartmentPayload,
  validateDepartment,
} from './department';

const valid = { ...emptyDepartmentInput(), name: 'Engineering' };

describe('validateDepartment', () => {
  it('accepts a name alone', () => {
    expect(validateDepartment(valid)).toEqual({});
  });

  it.each(['', '   ', '\n\t'])('requires a name (%j)', (name) => {
    expect(validateDepartment({ ...valid, name }).name).toBe('nameRequired');
  });

  it('accepts the longest values the service takes and refuses one more', () => {
    const longest = {
      ...valid,
      name: 'n'.repeat(DEPARTMENT_LIMITS.name),
      code: 'c'.repeat(DEPARTMENT_LIMITS.code),
      description: 'd'.repeat(DEPARTMENT_LIMITS.description),
    };

    expect(validateDepartment(longest)).toEqual({});
    expect(
      validateDepartment({
        ...longest,
        name: `${longest.name}n`,
        code: `${longest.code}c`,
        description: `${longest.description}d`,
      })
    ).toEqual({
      name: 'nameTooLong',
      code: 'codeTooLong',
      description: 'descriptionTooLong',
    });
  });

  it('measures the trimmed text, as the service does', () => {
    expect(validateDepartment({ ...valid, name: ` ${'n'.repeat(100)} ` })).toEqual({});
  });
});

describe('toDepartmentPayload', () => {
  it('trims every text and keeps the active flag', () => {
    expect(
      toDepartmentPayload({
        name: '  Procurement ',
        code: ' PRC ',
        description: ' Pengadaan ',
        isActive: false,
      })
    ).toEqual({ name: 'Procurement', code: 'PRC', description: 'Pengadaan', isActive: false });
  });
});

describe('toDepartmentInput', () => {
  it('copies the editable fields of a department', () => {
    expect(
      toDepartmentInput({
        id: 'd1',
        name: 'Keuangan',
        code: '',
        description: '',
        isActive: true,
      })
    ).toEqual({ name: 'Keuangan', code: '', description: '', isActive: true });
  });
});
