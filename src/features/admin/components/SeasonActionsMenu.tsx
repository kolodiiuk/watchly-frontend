import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface SeasonActionsMenuProps {
  canDelete?: boolean;
  onAddEpisode?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SeasonActionsMenu({ canDelete = true, onAddEpisode, onEdit, onDelete }: SeasonActionsMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" className="px-3 py-2" leadingIcon={<Plus className="h-4 w-4" />} onClick={onAddEpisode}>
        Add episode
      </Button>
      <Button variant="ghost" className="px-3 py-2" leadingIcon={<Pencil className="h-4 w-4" />} onClick={onEdit}>
        Edit
      </Button>
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
