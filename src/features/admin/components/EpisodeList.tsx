import type { AdminEpisodeRow } from '../models/types';
import { EpisodeItem } from './EpisodeItem';

interface EpisodeListProps {
  episodes: AdminEpisodeRow[];
  onEdit?: (episodeId: number) => void;
  onDelete?: (episodeId: number) => void;
}

export function EpisodeList({ episodes, onEdit, onDelete }: EpisodeListProps) {
  return (
    <div className="space-y-2">
      {episodes.map(episode => (
        <EpisodeItem
          key={episode.id}
          episode={episode}
          onEdit={() => onEdit?.(episode.id)}
          onDelete={() => onDelete?.(episode.id)}
        />
      ))}
    </div>
  );
}
