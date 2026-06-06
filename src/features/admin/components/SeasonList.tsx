import type { AdminSeasonRow } from '../models/types';
import { SeasonItem } from './SeasonItem';

interface SeasonListProps {
  seasons: AdminSeasonRow[];
  onAddEpisode?: (season: AdminSeasonRow) => void;
  onEditSeason?: (season: AdminSeasonRow) => void;
  onDeleteSeason?: (season: AdminSeasonRow) => void;
  onEditEpisode?: (season: AdminSeasonRow, episodeId: number) => void;
  onDeleteEpisode?: (season: AdminSeasonRow, episodeId: number) => void;
}

export function SeasonList({
  seasons,
  onAddEpisode,
  onEditSeason,
  onDeleteSeason,
  onEditEpisode,
  onDeleteEpisode,
}: SeasonListProps) {
  return (
    <div className="space-y-3">
      {seasons.map(season => (
        <SeasonItem
          key={season.id}
          season={season}
          onAddEpisode={onAddEpisode}
          onEditSeason={onEditSeason}
          onDeleteSeason={onDeleteSeason}
          onEditEpisode={onEditEpisode}
          onDeleteEpisode={onDeleteEpisode}
        />
      ))}
    </div>
  );
}
