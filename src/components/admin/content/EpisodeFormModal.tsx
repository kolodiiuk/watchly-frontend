import { FormActions } from './FormActions';

interface EpisodeFormModalProps {
  mode?: 'create' | 'edit';
  isOpen?: boolean;
}

export function EpisodeFormModal({ mode = 'create', isOpen = false }: EpisodeFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text">{mode === 'create' ? 'Add episode' : 'Edit episode'}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Episode number" />
          <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Runtime (minutes)" />
          <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm md:col-span-2" placeholder="Name" />
          <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm md:col-span-2" placeholder="Release date" />
          <textarea className="min-h-24 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm md:col-span-2" placeholder="Overview" />
        </div>
        <div className="mt-5">
          <FormActions saveLabel={mode === 'create' ? 'Create episode' : 'Save episode'} />
        </div>
      </div>
    </div>
  );
}
