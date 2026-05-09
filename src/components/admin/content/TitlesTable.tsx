import { Badge } from '../../ui/Badge';
import { TitleRowActions } from './TitleRowActions';
import type { AdminTitleRow } from './types';

interface TitlesTableProps {
  rows: AdminTitleRow[];
}

export function TitlesTable({ rows }: TitlesTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80">
      <div className="hidden grid-cols-[2.2fr_1fr_1fr_1fr_2fr] gap-3 bg-surface-raised px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted md:grid">
        <span>Name</span>
        <span>Type</span>
        <span>Release Date</span>
        <span>Rating</span>
        <span className="text-right">Actions</span>
      </div>

      <div className="divide-y divide-border/70 bg-surface/70">
        {rows.map(row => (
          <article key={row.id} className="grid gap-3 px-4 py-4 md:grid-cols-[2.2fr_1fr_1fr_1fr_2fr] md:items-center">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{row.name}</p>
            </div>
            <Badge tone={row.type === 'movie' ? 'accent' : 'warning'}>{row.type === 'movie' ? 'movie' : 'tv show'}</Badge>
            <p className="text-sm text-muted">{row.releaseDate}</p>
            <p className="text-sm text-muted">{row.rating.toFixed(1)}</p>
            <TitleRowActions isSeries={row.type === 'series'} />
          </article>
        ))}
      </div>
    </div>
  );
}
