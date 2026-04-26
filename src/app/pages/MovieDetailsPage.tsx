import { useMemo, useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useGetTitleQuery, type TitleInfo } from '../api/catalogApi';
import { WatchStatus } from '../models/watchStatus';

const formatReleaseDate = (value?: string | null) => {
  if (!value) return 'Release date not available';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

const formatRuntime = (runtime: number) => {
  if (!runtime || runtime <= 0) return 'Runtime not available';

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;

  return `${hours}h ${minutes}m`;
};

const formatRating = (rating?: number | null) => {
  if (rating === null || rating === undefined) return 'TMDB rating unavailable';
  return `${rating.toFixed(1)} / 10`;
};

const getFullImageUrl = (path: string, size: string) => {
    return "https://image.tmdb.org/t/p/" + size + path; 
}

const detailItems = (titleInfo: TitleInfo) => [
  { label: 'Release date', value: formatReleaseDate(titleInfo.releaseDate) },
  { label: 'Runtime', value: formatRuntime(titleInfo.runtime) },
  { label: 'Average TMDB rating', value: formatRating(titleInfo.avgTmdbRating) },
];

const watchStatusOptions = [
  { value: WatchStatus.PlanToWatch, label: 'Plan to watch' },
  { value: WatchStatus.Watching, label: 'Watching' },
  { value: WatchStatus.Completed, label: 'Completed' },
  { value: WatchStatus.Dropped, label: 'Dropped' },
];

export function MovieDetailsPage() {
  const { titleId: titleIdParam } = useParams<{ titleId: string }>();
  const titleId = Number(titleIdParam);
  const hasValidTitleId = Number.isInteger(titleId) && titleId > 0;
 const [selectedWatchStatus, setSelectedWatchStatus] = useState<WatchStatus>(WatchStatus.PlanToWatch)       
  const { data: titleInfo, isLoading, isError } = useGetTitleQuery(titleId, {
    skip: !hasValidTitleId,
  });

  const handleWatchStatusChange = (_titleId: number, _status: WatchStatus) => {
  };

  const onWatchStatusSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = Number(event.target.value) as WatchStatus;
    setSelectedWatchStatus(nextStatus);
    handleWatchStatusChange(titleId, nextStatus);
  };

  const title = useMemo<TitleInfo | null>(() => {
    if (!titleInfo) return null;

    return {
      id: titleInfo.id,
      name: titleInfo.name,
      overview: titleInfo.overview,
      posterUrl: titleInfo.posterUrl,
      releaseDate: titleInfo.releaseDate,
      runtime: titleInfo.runtime,
      avgTmdbRating: titleInfo.avgTmdbRating,
    };
  }, [titleInfo]);

  if (!hasValidTitleId) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Movie details</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">We could not load this title.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              The route is missing a valid movie id, so there is nothing for us to request yet.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised" className="animate-pulse">
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="aspect-[2/3] rounded-3xl bg-background/60" />
              <div className="space-y-4">
                <div className="h-4 w-28 rounded-full bg-background/60" />
                <div className="h-10 w-3/4 rounded-2xl bg-background/60" />
                <div className="h-24 rounded-3xl bg-background/60" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="h-20 rounded-2xl bg-background/60" />
                  <div className="h-20 rounded-2xl bg-background/60" />
                  <div className="h-20 rounded-2xl bg-background/60" />
                  <div className="h-20 rounded-2xl bg-background/60" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (isError || !title) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Movie details</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">This title is unavailable right now.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              We reached the catalog route, but no title details came back for this id.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card tone="glass" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,196,81,0.14),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(99,215,207,0.12),_transparent_34%)]" />

          <div className="relative grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-background/45">
              {title.posterUrl ? (
                <img
                  src={getFullImageUrl(title.posterUrl, "w500")}
                  alt={`${title.name} poster`}
                  className="aspect-[2/3] h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-background/60 p-6 text-center text-sm text-muted">
                  Poster unavailable
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="accent">Movie details</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">Catalog title</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                    {title.name}
                  </h1>
                </div>

                <p className="max-w-3xl text-sm leading-7 text-muted">
                  {title.overview?.trim() || 'Overview not available for this title yet.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {detailItems(title).map(item => (
                  <div key={item.label} className="rounded-2xl border border-border/80 bg-background/35 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-text">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border/80 bg-background/30 p-5">
                <div className="flex flex-col gap-4 sm:flex-column sm:items-left">
                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-accent">Status and actions</p>                  
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.2em] text-muted">Watch status</span>
                      <select
                        value={selectedWatchStatus}
                        onChange={onWatchStatusSelect}
                        className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30">
                        {watchStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                 </div>
                  <Button style={{ maxWidth: '150px', width: '100%' }} variant="secondary" disabled className="disabled:cursor-not-allowed disabled:opacity-70" >
                    Add to watchlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
