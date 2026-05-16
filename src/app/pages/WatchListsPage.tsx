import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useGetUserWatchListsQuery } from '../api/watchListApi.ts';

const getPosterUrl = (path: string) => `https://image.tmdb.org/t/p/w342${path}`;

export function WatchListsPage() {
  const { data: watchLists = [], isError, isFetching, isLoading, refetch } = useGetUserWatchListsQuery();
  const totalTitles = watchLists.reduce((count, list) => count + (list.titles?.length ?? 0), 0);

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">Watchlists</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Your saved titles</h1>
        </div>
        <div className="flex items-center gap-3">
          {isFetching ? <span className="text-sm text-muted">Updating...</span> : null}
          <Badge tone="accent">{totalTitles} titles</Badge>
        </div>
      </div>

      {isError ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5" tone="glass">
          <p className="text-sm text-danger">Unable to load your watchlists.</p>
          <button className="text-sm font-semibold text-primary hover:text-primary-strong" type="button" onClick={refetch}>
            Try again
          </button>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(item => (
            <Card key={item} className="h-44 animate-pulse" tone="glass" />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && watchLists.length === 0 ? (
        <Card className="p-6" tone="glass">
          <p className="text-sm text-muted">Your watchlists are empty. Add titles from the catalog to start building a queue.</p>
        </Card>
      ) : null}

      <div className="space-y-6">
        {watchLists.map(list => {
          const titles = list.titles ?? [];

          return (
            <section key={list.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-text">{list.name}</h2>
                  <p className="text-sm text-muted">
                    {titles.length} {titles.length === 1 ? 'title' : 'titles'}
                  </p>
                </div>
              </div>

              {titles.length === 0 ? (
                <Card className="p-5" tone="glass">
                  <p className="text-sm text-muted">No titles in this list yet.</p>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {titles.map(title => (
                    <Link key={title.id} to={`/title/${title.id}`} className="group">
                      <Card className="flex h-full flex-col p-4 transition hover:border-primary/50" tone="base">
                        <div className="aspect-2/3 w-full overflow-hidden rounded-2xl bg-background/50">
                          {title.posterUrl ? (
                            <img
                              alt={title.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              src={getPosterUrl(title.posterUrl)}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-muted">
                              No poster
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex flex-1 items-start justify-between gap-3">
                          <h3 className="text-base font-semibold text-text group-hover:text-primary">{title.name}</h3>
                          {title.avgTmdbRating != null ? (
                            <Badge className="shrink-0" tone="success">
                              {title.avgTmdbRating.toFixed(1)}
                            </Badge>
                          ) : null}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
