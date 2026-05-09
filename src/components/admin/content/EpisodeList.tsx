import type { AdminEpisodeRow } from './types';
import { EpisodeItem } from './EpisodeItem';

interface EpisodeListProps {
  episodes: AdminEpisodeRow[];
}

export function EpisodeList({ episodes }: EpisodeListProps) {
  return (
    <div className="space-y-2">
      {episodes.map(episode => (
        <EpisodeItem key={episode.id} episode={episode} />
      ))}
    </div>
  );
}
