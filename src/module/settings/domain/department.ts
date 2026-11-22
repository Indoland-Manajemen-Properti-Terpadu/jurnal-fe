/** Menu id of the Departments page (Settings); `JP-PURCH-FPPBJ` read is enough to pick one on a request. */
export const DEPARTMENT_MENU = 'JP-SETT-DEPT';

/** A department of the site, picked on a purchase request. Managed under Settings. */
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface DepartmentInput {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

/** Lengths the service accepts; a longer value is refused with a 400. */
export const DEPARTMENT_LIMITS = { name: 100, code: 20, description: 500 } as const;

export type DepartmentIssue = 'nameRequired' | 'nameTooLong' | 'codeTooLong' | 'descriptionTooLong';

export type DepartmentIssues = Partial<Record<'name' | 'code' | 'description', DepartmentIssue>>;

export const emptyDepartmentInput = (): DepartmentInput => ({
  name: '',
  code: '',
  description: '',
  isActive: true,
});

export const toDepartmentInput = (department: Department): DepartmentInput => ({
  name: department.name,
  code: department.code,
  description: department.description,
  isActive: department.isActive,
});

/** Checks the entry the way the service does, on the trimmed values. */
export const validateDepartment = (input: DepartmentInput): DepartmentIssues => {
  const issues: DepartmentIssues = {};
  const name = input.name.trim();
  if (!name) issues.name = 'nameRequired';
  else if (name.length > DEPARTMENT_LIMITS.name) issues.name = 'nameTooLong';
  if (input.code.trim().length > DEPARTMENT_LIMITS.code) issues.code = 'codeTooLong';
  if (input.description.trim().length > DEPARTMENT_LIMITS.description) {
    issues.description = 'descriptionTooLong';
  }
  return issues;
};

/** The request body: trimmed text, so a name of spaces never reaches the service. */
export const toDepartmentPayload = (input: DepartmentInput): DepartmentInput => ({
  name: input.name.trim(),
  code: input.code.trim(),
  description: input.description.trim(),
  isActive: input.isActive,
});
