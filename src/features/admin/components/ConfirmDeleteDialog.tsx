import { FormActions } from './FormActions';

interface ConfirmDeleteDialogProps {
  isOpen?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export function ConfirmDeleteDialog({
  isOpen = false,
  title = 'Delete item',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-5">
          <FormActions
            saveLabel={confirmLabel}
            onCancel={onCancel}
            onSave={onConfirm}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
