import { Pencil, Trash2, Layers } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface TitleRowActionsProps {
  isSeries?: boolean;
  canManageSeasons?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageSeasons?: () => void;
}

export function TitleRowActions({
  isSeries = false,
  canManageSeasons = true,
  canDelete = true,
  onEdit,
  onDelete,
  onManageSeasons,
}: TitleRowActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button variant="ghost" className="px-3 py-2" leadingIcon={<Pencil className="h-4 w-4" />} onClick={onEdit}>
        Edit
      </Button>
      {isSeries && (
        <Button
          variant="ghost"
          className="px-3 py-2"
          leadingIcon={<Layers className="h-4 w-4" />}
          onClick={onManageSeasons}
          disabled={!canManageSeasons}>
          Manage seasons
        </Button>
      )}
      <Button
        variant="ghost"
        className="px-3 py-2 text-danger hover:text-danger"
        leadingIcon={<Trash2 className="h-4 w-4" />}
        onClick={onDelete}
        disabled={!canDelete}>
        Delete
      </Button>
    </div>
  );
}

