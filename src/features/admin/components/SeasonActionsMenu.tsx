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
      <Button
        variant="ghost"
        className="h-9 w-9 justify-center !gap-0 !p-0"
        leadingIcon={<Pencil className="h-4 w-4" />}
        onClick={onEdit}
        aria-label="Edit season"
        title="Edit season"
      />
      <Button
        variant="ghost"
        className="h-9 w-9 justify-center !gap-0 !p-0 text-danger hover:text-danger"
        leadingIcon={<Trash2 className="h-4 w-4" />}
        onClick={onDelete}
        disabled={!canDelete}
        aria-label="Delete season"
        title="Delete season"
      />
    </div>
  );
}
