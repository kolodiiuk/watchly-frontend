import { TitleBaseFields } from './TitleBaseFields';
import { TitleMetaFields } from './TitleMetaFields';
import { TitleTypeSwitch } from './TitleTypeSwitch';
import { MovieFieldsSection } from './MovieFieldsSection';
import { FormActions } from './FormActions';

interface TitleFormModalProps {
  mode?: 'create' | 'edit';
  isOpen?: boolean;
}

export function TitleFormModal({ mode = 'create', isOpen = false }: TitleFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-text">{mode === 'create' ? 'Create title' : 'Edit title'}</h2>
        <div className="mt-4 space-y-5">
          <TitleTypeSwitch />
          <TitleBaseFields />
          <TitleMetaFields />
          <MovieFieldsSection />
          <FormActions saveLabel={mode === 'create' ? 'Create' : 'Save changes'} />
        </div>
      </div>
    </div>
  );
}
