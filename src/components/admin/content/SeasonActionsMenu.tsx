import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';

interface SeasonActionsMenuProps {
  canDelete?: boolean;
}

export function SeasonActionsMenu({ canDelete = true }: SeasonActionsMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" className="px-3 py-2" leadingIcon={<Plus className="h-4 w-4" />}>
        Add episode
      </Button>
      <Button variant="ghost" className="px-3 py-2" leadingIcon={<Pencil className="h-4 w-4" />}>
        Edit
      </Button>
      <Button
        variant="ghost"
        className="px-3 py-2 text-danger hover:text-danger"
        leadingIcon={<Trash2 className="h-4 w-4" />}
        disabled={!canDelete}>
        Delete
      </Button>
    </div>
  );
}
