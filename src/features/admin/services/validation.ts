export type ValidationErrors = Record<string, string>;

export const validateRequired = (value: string, fieldName: string) =>
  value.trim().length > 0 ? '' : `${fieldName} is required.`;

export const validateNonNegativeNumber = (value: number, fieldName: string) =>
  Number.isFinite(value) && value >= 0 ? '' : `${fieldName} must be a non-negative number.`;

export const fieldError = (errors: ValidationErrors, fieldName: string) => errors[fieldName] ?? '';
