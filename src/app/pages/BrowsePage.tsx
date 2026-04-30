import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  type FilterRequest,
  useFilterTitlesQuery,
  useSearchTitlesQuery,
} from '../api/catalogApi.ts';
import { TitleType } from '../models/TitleType.tsx';

const genreOptions = [
  { id: 28, label: 'Action' },
  { id: 12, label: 'Adventure' },
  { id: 16, label: 'Animation' },
  { id: 35, label: 'Comedy' },
  { id: 80, label: 'Crime' },
  { id: 18, label: 'Drama' },
  { id: 14, label: 'Fantasy' },
  { id: 27, label: 'Horror' },
  { id: 9648, label: 'Mystery' },
  { id: 10749, label: 'Romance' },
  { id: 878, label: 'Science Fiction' },
  { id: 53, label: 'Thriller' },
];

const typeOptions = [
  { id: TitleType.Movie, label: 'Movie' },
  { id: TitleType.Series, label: 'TV Series' },
];

const sortOptions = [
  { value: 'releaseDate', label: 'Release date' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
] as const;

type CatalogSortBy = (typeof sortOptions)[number]['value'];
type SortOrder = 'desc' | 'asc';

const pageSizes = [12, 20, 24, 40];

function toggleNumber(list: number[], value: number) {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
}

// todo: formatters.ts
const getFullImageUrl = (path: string, size: string) => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export function BrowsePage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [ratingStart, setRatingStart] = useState('');
  const [ratingEnd, setRatingEnd] = useState('');
  const [sortBy, setSortBy] = useState<CatalogSortBy>('releaseDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const hasSearch = searchTerm.trim().length > 0;
  const filtersDisabled = hasSearch;

  const filterRequest = useMemo<FilterRequest>(() => {
    const yearsRange = yearStart && yearEnd ? { start: Number(yearStart), end: Number(yearEnd) } : undefined;
    const ratingRange = ratingStart && ratingEnd ? { start: Number(ratingStart), end: Number(ratingEnd) } : undefined;

    return {
      genres: selectedGenres.length ? selectedGenres : undefined,
      titleTypes: selectedTypes.length ? selectedTypes : undefined,
      yearsRange,
      ratingRange,
      page,
      size,
      sortBy,
      sortOrder,
    };
  }, [page, ratingEnd, ratingStart, selectedGenres, selectedTypes, size, sortBy, sortOrder, yearEnd, yearStart]);

  const searchQuery = useSearchTitlesQuery(
    { term: searchTerm, page, pageSize: size },
    { skip: !hasSearch },
  );
  const filterQuery = useFilterTitlesQuery(filterRequest, { skip: hasSearch });

  const titles = (hasSearch ? searchQuery.data : filterQuery.data) ?? [];
  const isLoading = hasSearch ? searchQuery.isLoading : filterQuery.isLoading;
  const isFetching = hasSearch ? searchQuery.isFetching : filterQuery.isFetching;
  const isError = hasSearch ? searchQuery.isError : filterQuery.isError;

  const canPrevious = page > 1;
  const canNext = titles.length === size && !isLoading;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSelectedTypes([]);
    setYearStart('');
    setYearEnd('');
    setRatingStart('');
    setRatingEnd('');
    setPage(1);
  };

  const titleCardBadgeClassName = 'min-w-[6.75rem] justify-center rounded-2xl px-3 py-1.5 normal-case tracking-normal whitespace-nowrap';

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card className="p-5" tone="glass">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text">Filters</h2>
              <Button variant="ghost" type="button" onClick={handleResetFilters} disabled={filtersDisabled}>
                Reset
              </Button>
            </div>

            {filtersDisabled ? (
              <p className="mt-2 text-xs text-muted">Filters apply when the search field is empty.</p>
            ) : null}

            <div className="mt-4 space-y-5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Genres</p>
                <div className="grid gap-2">
                  {genreOptions.map(option => (
                    <label key={option.id} className="flex items-center gap-2 text-sm text-text">
                      <input
                        className="h-4 w-4 accent-primary"
                        type="checkbox"
                        checked={selectedGenres.includes(option.id)}
                        onChange={() => {
                          if (filtersDisabled) return;
                          setSelectedGenres(prev => toggleNumber(prev, option.id));
                          setPage(1);
                        }}
                        disabled={filtersDisabled}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Type</p>
                <div className="grid gap-2">
                  {typeOptions.map(option => (
                    <label key={option.id} className="flex items-center gap-2 text-sm text-text">
                      <input
                        className="h-4 w-4 accent-primary"
                        type="checkbox"
                        checked={selectedTypes.includes(option.id)}
                        onChange={() => {
                          if (filtersDisabled) return;
                          setSelectedTypes(prev => toggleNumber(prev, option.id));
                          setPage(1);
                        }}
                        disabled={filtersDisabled}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Release year</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    type="number"
                    min={1900}
                    max={2100}
                    placeholder="From"
                    value={yearStart}
                    onChange={event => {
                      if (filtersDisabled) return;
                      setYearStart(event.target.value);
                      setPage(1);
                    }}
                    disabled={filtersDisabled}
                  />
                  <input
                    className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    type="number"
                    min={1900}
                    max={2100}
                    placeholder="To"
                    value={yearEnd}
                    onChange={event => {
                      if (filtersDisabled) return;
                      setYearEnd(event.target.value);
                      setPage(1);
                    }}
                    disabled={filtersDisabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Rating</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    type="number"
                    step="0.1"
                    min={0}
                    max={10}
                    placeholder="From"
                    value={ratingStart}
                    onChange={event => {
                      if (filtersDisabled) return;
                      setRatingStart(event.target.value);
                      setPage(1);
                    }}
                    disabled={filtersDisabled}
                  />
                  <input
                    className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    type="number"
                    step="0.1"
                    min={0}
                    max={10}
                    placeholder="To"
                    value={ratingEnd}
                    onChange={event => {
                      if (filtersDisabled) return;
                      setRatingEnd(event.target.value);
                      setPage(1);
                    }}
                    disabled={filtersDisabled}
                  />
                </div>
              </div>
            </div>
          </Card>
        </aside>

        <section className="space-y-4">
          <Card className="p-5" tone="raised">
            <div className="flex flex-wrap items-center gap-4">
              <form className="flex flex-1 flex-wrap items-center gap-3" onSubmit={handleSearchSubmit}>
                <input
                  className="min-w-60 flex-1 rounded-2xl border border-border bg-background/60 px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                  type="text"
                  placeholder="Search by title"
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                />
                <Button type="submit">Search</Button>
                {searchTerm ? (
                  <Button variant="ghost" type="button" onClick={handleClearSearch}>
                    Clear
                  </Button>
                ) : null}
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-text"
                  value={sortBy}
                  onChange={event => {
                    setSortBy(event.target.value as CatalogSortBy);
                    setPage(1);
                  }}>
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-text"
                  value={sortOrder}
                  onChange={event => {
                    setSortOrder(event.target.value as SortOrder);
                    setPage(1);
                  }}>
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>

                <select
                  className="rounded-2xl border border-border bg-background/60 px-3 py-2 text-sm text-text"
                  value={size}
                  onChange={event => {
                    setSize(Number(event.target.value));
                    setPage(1);
                  }}>
                  {pageSizes.map(value => (
                    <option key={value} value={value}>
                      {value} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between text-sm text-muted">
            <span>{hasSearch ? `Search results: ${searchTerm}` : 'Catalog by filters'}</span>
            {isFetching ? <span>Updating...</span> : null}
          </div>

          {isError ? (
            <Card className="p-5" tone="glass">
              <p className="text-sm text-danger">Unable to load the catalog. Please try again later.</p>
            </Card>
          ) : null}

          {!isLoading && !isError && titles.length === 0 ? (
            <Card className="p-5" tone="glass">
              <p className="text-sm text-muted">Nothing was found. Try adjusting the filters or search term.</p>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {titles.map(title => (
              <Link key={title.id} to={`/title/${title.id}`} className="group">
                <Card className="flex h-full flex-col p-4 transition hover:border-primary/50" tone="base">
                  <div className="aspect-2/3 w-full overflow-hidden rounded-2xl bg-surface">
                    {title.posterUrl ? (
                      <img
                        alt={title.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        src={getFullImageUrl(title.posterUrl, 'w500')}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                        No poster
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-1 flex-row justify-between gap-2">
                    <h3 className="text-base font-semibold text-text group-hover:text-primary">{title.name}</h3>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted">
                      {title.avgTmdbRating != null ? (
                        <Badge className={titleCardBadgeClassName} tone="success">
                          {title.avgTmdbRating.toFixed(1)}
                        </Badge>
                      ) : (
                        <Badge className={titleCardBadgeClassName} tone="warning">
                          no rating
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted">Page {page}</div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" type="button" onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={!canPrevious}>
                Previous
              </Button>
              <Button variant="secondary" type="button" onClick={() => setPage(prev => prev + 1)} disabled={!canNext}>
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
