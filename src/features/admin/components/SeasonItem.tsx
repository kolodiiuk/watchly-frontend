import { ChevronDown } from 'lucide-react';
import type { AdminSeasonRow } from '../models/types';
import { EpisodeList } from './EpisodeList';
import { SeasonActionsMenu } from './SeasonActionsMenu';

interface SeasonItemProps {
  season: AdminSeasonRow;
  onAddEpisode?: (season: AdminSeasonRow) => void;
  onEditSeason?: (season: AdminSeasonRow) => void;
  onDeleteSeason?: (season: AdminSeasonRow) => void;
  onEditEpisode?: (season: AdminSeasonRow, episodeId: number) => void;
  onDeleteEpisode?: (season: AdminSeasonRow, episodeId: number) => void;
}

export function SeasonItem({
  season,
  onAddEpisode,
  onEditSeason,
  onDeleteSeason,
  onEditEpisode,
  onDeleteEpisode,
}: SeasonItemProps) {
  return (
    <article className="rounded-2xl border border-border/80 bg-surface/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-muted" />
          <h4 className="text-sm font-semibold text-text">
            Season {season.ordinalNumber}: {season.name}
          </h4>
          <span className="text-xs text-muted">({season.episodesCount} episodes)</span>
        </div>
        <SeasonActionsMenu
          onAddEpisode={() => onAddEpisode?.(season)}
          onEdit={() => onEditSeason?.(season)}
          onDelete={() => onDeleteSeason?.(season)}
        />
      </div>
      <div className="mt-3">
        <EpisodeList
          episodes={season.episodes}
          onEdit={episodeId => onEditEpisode?.(season, episodeId)}
          onDelete={episodeId => onDeleteEpisode?.(season, episodeId)}
        />
      </div>
    </article>
  );
}
