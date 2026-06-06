import { useEffect, useState } from 'react';
import type { AdminSeasonFormValues } from '../models/types';
import type { ValidationErrors } from '../services/validation';
import { fieldError } from '../services/validation';
import { FormActions } from './FormActions';

interface SeasonFormModalProps {
  mode?: 'create' | 'edit';
  isOpen?: boolean;
  initialValues: AdminSeasonFormValues;
  errors?: ValidationErrors;
  isSubmitting?: boolean;
  onClose?: () => void;
  onSubmit?: (values: AdminSeasonFormValues) => void | Promise<void>;
}

const inputClass =
  'rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40';

export function SeasonFormModal({
  mode = 'create',
  isOpen = false,
  initialValues,
  errors = {},
  isSubmitting = false,
  onClose,
  onSubmit,
}: SeasonFormModalProps) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
    }
  }, [initialValues, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => onSubmit?.(values);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text">{mode === 'create' ? 'Add season' : 'Edit season'}</h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">Season name</span>
            <input
              className={inputClass}
              value={values.name}
              onChange={event => setValues(current => ({ ...current, name: event.target.value }))}
              placeholder="Season name"
            />
            {fieldError(errors, 'name') ? <span className="text-xs text-danger">{fieldError(errors, 'name')}</span> : null}
          </label>
          <label className="grid gap-1">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">Ordinal number</span>
            <input
              className={inputClass}
              type="number"
              min="1"
              value={values.ordinalNumber}
              onChange={event => setValues(current => ({ ...current, ordinalNumber: event.target.value }))}
              placeholder="Ordinal number"
            />
            {fieldError(errors, 'ordinalNumber') ? (
              <span className="text-xs text-danger">{fieldError(errors, 'ordinalNumber')}</span>
            ) : null}
          </label>
        </div>
        <div className="mt-5">
          <FormActions
            saveLabel={mode === 'create' ? 'Create season' : 'Save season'}
            onCancel={onClose}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
