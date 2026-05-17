import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  useCreateCustomWatchListMutation,
  useDeleteCustomWatchListMutation,
  useGetUserWatchListsQuery,
  useRenameCustomWatchListMutation,
} from '../api/watchListApi.ts';

const getPosterUrl = (path: string) => `https://image.tmdb.org/t/p/w342${path}`;

const isDefaultWatchList = (list: { isDefault?: boolean; name: string }) =>
  list.isDefault === true || list.name === 'Default';

const getWatchListNameWarning = (name: string) => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Watchlist name cannot be empty.';
  }

  if (trimmedName.toLowerCase() === 'default') {
    return 'Default is reserved for the built-in watchlist.';
  }

  return null;
};

export function WatchListsPage() {
  const { data: watchLists = [], isError, isFetching, isLoading, refetch } = useGetUserWatchListsQuery();
  const [createCustomWatchList, createState] = useCreateCustomWatchListMutation();
  const [deleteCustomWatchList, deleteState] = useDeleteCustomWatchListMutation();
  const [renameCustomWatchList, renameState] = useRenameCustomWatchListMutation();
  const [newListName, setNewListName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingListId, setDeletingListId] = useState<number | null>(null);
  const [renamingListId, setRenamingListId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const totalTitles = watchLists.reduce((count, list) => count + (list.titles?.length ?? 0), 0);
  const trimmedListName = newListName.trim();
  const trimmedRenameValue = renameValue.trim();

  const handleCreateWatchList = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const warning = getWatchListNameWarning(newListName);
    if (warning) {
      setActionError(warning);
      return;
    }

    setActionError(null);
    try {
      await createCustomWatchList(trimmedListName).unwrap();
      setNewListName('');
      await refetch();
    } catch {
      setActionError('Unable to create the watchlist. Please try a different name.');
    }
  };

  const handleDeleteWatchList = async (watchListId: number, name: string) => {
    const confirmed = window.confirm(`Delete "${name}"?`);
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeletingListId(watchListId);
    try {
      await deleteCustomWatchList(watchListId).unwrap();
      await refetch();
    } catch {
      setActionError('Unable to delete this watchlist. Default watchlists cannot be removed.');
    } finally {
      setDeletingListId(null);
    }
  };

  const startRename = (watchListId: number, name: string) => {
    setActionError(null);
    setRenamingListId(watchListId);
    setRenameValue(name);
  };

  const cancelRename = () => {
    setRenamingListId(null);
    setRenameValue('');
  };

  const handleRenameWatchList = async (event: FormEvent<HTMLFormElement>, watchListId: number) => {
    event.preventDefault();
    const warning = getWatchListNameWarning(renameValue);
    if (warning) {
      setActionError(warning);
      return;
    }

    setActionError(null);
    try {
      await renameCustomWatchList({ watchListId, newName: trimmedRenameValue }).unwrap();
      cancelRename();
      await refetch();
    } catch {
      setActionError('Unable to rename this watchlist. Please try a different name.');
    }
  };

  const sortedWatchLists = [...watchLists].sort((left, right) => {
    if (isDefaultWatchList(left)) {
      return -1;
    }

    if (isDefaultWatchList(right)) {
      return 1;
    }

    return 0;
  });

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

      <Card className="p-5" tone="raised">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleCreateWatchList}>
          <label className="flex-1 space-y-2">
            <span className="text-sm font-medium text-text">Create custom watchlist</span>
            <input
              className="w-full rounded-2xl border border-border bg-background/60 px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
              maxLength={80}
              placeholder="Weekend movies"
              type="text"
              value={newListName}
              onChange={event => {
                setNewListName(event.target.value);
                setActionError(null);
              }}
            />
          </label>
          <Button type="submit" disabled={createState.isLoading}>
            {createState.isLoading ? 'Creating...' : 'Create'}
          </Button>
        </form>
        {actionError ? <p className="mt-3 text-sm text-danger">{actionError}</p> : null}
      </Card>

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
        {sortedWatchLists.map(list => {
          const titles = list.titles ?? [];
          const isDefaultList = isDefaultWatchList(list);
          const isRenamingThisList = renamingListId === list.id;

          return (
            <section key={list.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {isRenamingThisList ? (
                  <form
                    className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center"
                    onSubmit={event => void handleRenameWatchList(event, list.id)}
                  >
                    <input
                      autoFocus
                      className="min-w-60 flex-1 rounded-2xl border border-border bg-background/60 px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                      maxLength={80}
                      type="text"
                      value={renameValue}
                      onChange={event => {
                        setRenameValue(event.target.value);
                        setActionError(null);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Button type="submit" disabled={renameState.isLoading}>
                        {renameState.isLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button type="button" variant="ghost" onClick={cancelRename}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-text">{list.name}</h2>
                    <p className="text-sm text-muted">
                      {titles.length} {titles.length === 1 ? 'title' : 'titles'}
                    </p>
                  </div>
                )}
                {!isDefaultList ? (
                  <div className={isRenamingThisList ? 'hidden' : 'flex items-center gap-2'}>
                    <Button type="button" variant="secondary" onClick={() => startRename(list.id, list.name)}>
                      Rename
                    </Button>
                    <Button
                      className="border-danger/40 text-danger hover:bg-danger/10 hover:text-danger"
                      disabled={deleteState.isLoading && deletingListId === list.id}
                      type="button"
                      variant="secondary"
                      onClick={() => void handleDeleteWatchList(list.id, list.name)}
                    >
                      {deleteState.isLoading && deletingListId === list.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                ) : null}
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
