import { useState } from 'react';
import type { AdminTitleFormValues } from '../models/types';
import type { ValidationErrors } from '../services/validation';
import { TitleBaseFields } from './TitleBaseFields';
import { TitleMetaFields } from './TitleMetaFields';
import { TitleRelationsFields } from './TitleRelationsFields';
import { TitleTypeSwitch } from './TitleTypeSwitch';
import { FormActions } from './FormActions';

interface TitleFormModalProps {
  mode?: 'create' | 'edit';
  isOpen?: boolean;
  initialValues: AdminTitleFormValues;
  errors?: ValidationErrors;
  isSubmitting?: boolean;
  onClose?: () => void;
  onSubmit?: (values: AdminTitleFormValues) => void | Promise<void>;
}

export function TitleFormModal({
  mode = 'create',
  isOpen = false,
  initialValues,
  errors = {},
  isSubmitting = false,
  onClose,
  onSubmit,
}: TitleFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <TitleFormContent
      mode={mode}
      initialValues={initialValues}
      errors={errors}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function TitleFormContent({
  mode = 'create',
  initialValues,
  errors = {},
  isSubmitting = false,
  onClose,
  onSubmit,
}: Omit<TitleFormModalProps, 'isOpen'>) {
  const [values, setValues] = useState(initialValues);

  const handleSubmit = () => onSubmit?.(values);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-text">{mode === 'create' ? 'Create title' : 'Edit title'}</h2>
        <div className="mt-4 space-y-5">
          <TitleTypeSwitch value={values.titleType} onChange={titleType => setValues(current => ({ ...current, titleType }))} />
          <TitleBaseFields values={values} errors={errors} onChange={patch => setValues(current => ({ ...current, ...patch }))} />
          <TitleMetaFields values={values} errors={errors} onChange={patch => setValues(current => ({ ...current, ...patch }))} />
          <TitleRelationsFields values={values} onChange={patch => setValues(current => ({ ...current, ...patch }))} />
          <FormActions
            saveLabel={mode === 'create' ? 'Create' : 'Save changes'}
            onCancel={onClose}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
