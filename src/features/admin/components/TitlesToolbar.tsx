import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { AdminSortOption, AdminTitleTypeFilter } from '../models/types';

interface TitlesToolbarProps {
  searchValue?: string;
  selectedType?: AdminTitleTypeFilter;
  selectedSort?: AdminSortOption;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onTypeChange?: (value: AdminTitleTypeFilter) => void;
  onSortChange?: (value: AdminSortOption) => void;
  showTypeFilter?: boolean;
}

export function TitlesToolbar({
  searchValue = '',
  selectedType = 'all',
  selectedSort = 'name',
  onSearchChange,
  onSearchSubmit,
  onTypeChange,
  onSortChange,
  showTypeFilter = true,
}: TitlesToolbarProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => onSearchChange?.(event.target.value);
  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) =>
    onTypeChange?.(event.target.value as AdminTitleTypeFilter);
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => onSortChange?.(event.target.value as AdminSortOption);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface/80 p-4 md:flex-row md:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              onSearchSubmit?.();
            }
          }}
          placeholder="Search titles"
          className="w-full rounded-xl border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      <Button variant="secondary" leadingIcon={<Search className="h-4 w-4" />} onClick={onSearchSubmit}>
        Search
      </Button>

      {showTypeFilter ? (
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40">
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="series">TV Shows</option>
        </select>
      ) : null}

      <select
        value={selectedSort}
        onChange={handleSortChange}
        className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40">
        <option value="name">Sort: Name</option>
        <option value="releaseDate">Sort: Release date</option>
        <option value="rating">Sort: Rating</option>
      </select>
    </div>
  );
}
