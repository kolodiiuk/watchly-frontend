import { FormActions } from './FormActions';

interface SeasonFormModalProps {
  mode?: 'create' | 'edit';
  isOpen?: boolean;
}

export function SeasonFormModal({ mode = 'create', isOpen = false }: SeasonFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text">{mode === 'create' ? 'Add season' : 'Edit season'}</h2>
        <div className="mt-4 grid gap-3">
          <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Season name" />
          <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Ordinal number" />
        </div>
        <div className="mt-5">
          <FormActions saveLabel={mode === 'create' ? 'Create season' : 'Save season'} />
        </div>
      </div>
    </div>
  );
}
