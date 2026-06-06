import { Plus } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { SeasonList } from './SeasonList';
import type { AdminSeasonRow } from '../models/types';

interface SeriesStructurePanelProps {
  titleName?: string;
  seasons: AdminSeasonRow[];
  onAddSeason?: () => void;
  onAddEpisode?: (season: AdminSeasonRow) => void;
  onEditSeason?: (season: AdminSeasonRow) => void;
  onDeleteSeason?: (season: AdminSeasonRow) => void;
  onEditEpisode?: (season: AdminSeasonRow, episodeId: number) => void;
  onDeleteEpisode?: (season: AdminSeasonRow, episodeId: number) => void;
}

export function SeriesStructurePanel({
  titleName = 'Selected series',
  seasons,
  onAddSeason,
  onAddEpisode,
  onEditSeason,
  onDeleteSeason,
  onEditEpisode,
  onDeleteEpisode,
}: SeriesStructurePanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/80 bg-surface/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text">Series Structure: {titleName}</h3>
        <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={onAddSeason}>
          Add season
        </Button>
      </div>
      <SeasonList
        seasons={seasons}
        onAddEpisode={onAddEpisode}
        onEditSeason={onEditSeason}
        onDeleteSeason={onDeleteSeason}
        onEditEpisode={onEditEpisode}
        onDeleteEpisode={onDeleteEpisode}
      />
    </section>
  );
}
