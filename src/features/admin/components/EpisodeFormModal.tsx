import { useEffect, useState } from 'react';
import type { AdminEpisodeFormValues } from '../models/types';
import type { ValidationErrors } from '../services/validation';
import { fieldError } from '../services/validation';
import { FormActions } from './FormActions';

interface EpisodeFormModalProps {
  mode?: 'create' | 'edit';
  isOpen?: boolean;
  initialValues: AdminEpisodeFormValues;
  errors?: ValidationErrors;
  isSubmitting?: boolean;
  isLoadingInitialValues?: boolean;
  onClose?: () => void;
  onSubmit?: (values: AdminEpisodeFormValues) => void | Promise<void>;
}

const inputClass =
  'rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40';

export function EpisodeFormModal({
  mode = 'create',
  isOpen = false,
  initialValues,
  errors = {},
  isSubmitting = false,
  isLoadingInitialValues = false,
  onClose,
  onSubmit,
}: EpisodeFormModalProps) {
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
      <div className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text">{mode === 'create' ? 'Add episode' : 'Edit episode'}</h2>
        {isLoadingInitialValues ? (
          <div className="mt-4 rounded-xl border border-border/70 bg-background/30 px-4 py-8 text-center text-sm text-muted">
            Loading episode details...
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">Episode number</span>
              <input
                className={inputClass}
                type="number"
                min="1"
                value={values.ordinalNumber}
                onChange={event => setValues(current => ({ ...current, ordinalNumber: event.target.value }))}
                placeholder="Episode number"
              />
              {fieldError(errors, 'ordinalNumber') ? (
                <span className="text-xs text-danger">{fieldError(errors, 'ordinalNumber')}</span>
              ) : null}
            </label>
            <label className="grid gap-1">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">Runtime</span>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={values.runtime}
                onChange={event => setValues(current => ({ ...current, runtime: event.target.value }))}
                placeholder="Runtime (minutes)"
              />
              {fieldError(errors, 'runtime') ? <span className="text-xs text-danger">{fieldError(errors, 'runtime')}</span> : null}
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">Name</span>
              <input
                className={inputClass}
                value={values.name}
                onChange={event => setValues(current => ({ ...current, name: event.target.value }))}
                placeholder="Name"
              />
              {fieldError(errors, 'name') ? <span className="text-xs text-danger">{fieldError(errors, 'name')}</span> : null}
            </label>
            <label className="grid gap-1">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">TV Show ID</span>
              <input
                className={inputClass}
                type="number"
                min="1"
                value={values.tvShowId}
                onChange={event => setValues(current => ({ ...current, tvShowId: event.target.value }))}
                placeholder="TV show ID"
              />
              {fieldError(errors, 'tvShowId') ? <span className="text-xs text-danger">{fieldError(errors, 'tvShowId')}</span> : null}
            </label>
            <label className="grid gap-1">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">Release date</span>
              <input
                className={inputClass}
                type="date"
                value={values.releaseDate}
                onChange={event => setValues(current => ({ ...current, releaseDate: event.target.value }))}
              />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">Poster URL</span>
              <input
                className={inputClass}
                value={values.posterUrl}
                onChange={event => setValues(current => ({ ...current, posterUrl: event.target.value }))}
                placeholder="https://..."
              />
            </label>
          </div>
        )}
        <div className="mt-5">
          <FormActions
            saveLabel={mode === 'create' ? 'Create episode' : 'Save episode'}
            onCancel={onClose}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
            isDisabled={isLoadingInitialValues}
          />
        </div>
      </div>
    </div>
  );
}
