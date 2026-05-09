import { Button } from '../../ui/Button';

interface FormActionsProps {
  saveLabel?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
}

export function FormActions({
  saveLabel = 'Save',
  isSubmitting = false,
  isDisabled = false,
  onCancel,
  onSave,
}: FormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 pt-4">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isDisabled || isSubmitting}>
        {isSubmitting ? 'Saving...' : saveLabel}
      </Button>
    </div>
  );
}
