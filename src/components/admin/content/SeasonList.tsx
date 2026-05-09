import type { AdminSeasonRow } from './types';
import { SeasonItem } from './SeasonItem';

interface SeasonListProps {
  seasons: AdminSeasonRow[];
}

export function SeasonList({ seasons }: SeasonListProps) {
  return (
    <div className="space-y-3">
      {seasons.map(season => (
        <SeasonItem key={season.id} season={season} />
      ))}
    </div>
  );
}
