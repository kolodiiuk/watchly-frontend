import { FormActions } from './FormActions';

interface ConfirmDeleteDialogProps {
  isOpen?: boolean;
  targetType?: 'title' | 'season' | 'episode';
}

export function ConfirmDeleteDialog({ isOpen = false, targetType = 'title' }: ConfirmDeleteDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text">Delete {targetType}</h2>
        <p className="mt-2 text-sm text-muted">This is a placeholder confirmation dialog for destructive action.</p>
        <div className="mt-5">
          <FormActions saveLabel="Delete" />
        </div>
      </div>
    </div>
  );
}
