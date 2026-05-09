import { Pencil, Trash2 } from 'lucide-react';
import type { AdminEpisodeRow } from './types';
import { Button } from '../../ui/Button';

interface EpisodeItemProps {
  episode: AdminEpisodeRow;
}

export function EpisodeItem({ episode }: EpisodeItemProps) {
  return (
    <div className="grid gap-2 rounded-xl border border-border/70 bg-background/30 p-3 md:grid-cols-[auto_1fr_auto] md:items-center">
      <span className="text-xs text-muted">E{episode.ordinalNumber}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{episode.name}</p>
        <p className="text-xs text-muted">{episode.releaseDate} · {episode.runtime}m</p>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" className="px-2 py-1.5" leadingIcon={<Pencil className="h-4 w-4" />}>
          Edit
        </Button>
        <Button variant="ghost" className="px-2 py-1.5 text-danger hover:text-danger" leadingIcon={<Trash2 className="h-4 w-4" />}>
          Delete
        </Button>
      </div>
    </div>
  );
}
