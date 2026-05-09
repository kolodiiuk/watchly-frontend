import { Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { SeasonList } from './SeasonList';
import type { AdminSeasonRow } from './types';

interface SeriesStructurePanelProps {
  titleName?: string;
  seasons: AdminSeasonRow[];
}

export function SeriesStructurePanel({ titleName = 'Selected series', seasons }: SeriesStructurePanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/80 bg-surface/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text">Series Structure: {titleName}</h3>
        <Button leadingIcon={<Plus className="h-4 w-4" />}>Add season</Button>
      </div>
      <SeasonList seasons={seasons} />
    </section>
  );
}
