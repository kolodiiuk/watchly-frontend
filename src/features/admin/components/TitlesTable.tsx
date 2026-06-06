import { Badge } from '../../../components/common/Badge';
import { TitleRowActions } from './TitleRowActions';
import type { AdminTitleRow } from '../models/types';

interface TitlesTableProps {
  rows: AdminTitleRow[];
  activeTitleId?: number | null;
  onEdit?: (row: AdminTitleRow) => void;
  onDelete?: (row: AdminTitleRow) => void;
  onManageSeasons?: (row: AdminTitleRow) => void;
}

export function TitlesTable({ rows, activeTitleId = null, onEdit, onDelete, onManageSeasons }: TitlesTableProps) {
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
          <article
            key={row.id}
            className={`grid gap-3 px-4 py-4 md:grid-cols-[2.2fr_1fr_1fr_1fr_2fr] md:items-center ${
              activeTitleId === row.id ? 'bg-primary/5' : ''
            }`}>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{row.name}</p>
            </div>
            <Badge className="w-full justify-center text-center" tone={row.type === 'movie' ? 'accent' : 'warning'}>
              {row.type === 'movie' ? 'movie' : 'tv show'}
            </Badge>
            <p className="text-sm text-muted">{row.releaseDate}</p>
            <p className="text-sm text-muted">{row.rating.toFixed(1)}</p>
            <TitleRowActions
              isSeries={row.type === 'series'}
              onEdit={() => onEdit?.(row)}
              onDelete={() => onDelete?.(row)}
              onManageSeasons={() => onManageSeasons?.(row)}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
