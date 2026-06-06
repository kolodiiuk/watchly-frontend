import {useState} from 'react';
import type {FormEvent} from 'react';
import {Button} from '../../../components/common/Button';
import {Card} from '../../../components/common/Card';
import {
  useClearDefaultWatchListMutation,
  useClearWatchListByIdMutation,
  useCreateCustomWatchListMutation,
  useDeleteCustomWatchListMutation,
  useGetUserWatchListsQuery,
  useRemoveTitleFromDefaultWatchListMutation,
  useRemoveTitleFromWatchListByIdMutation,
  useRenameCustomWatchListMutation,
} from '../api/watchListApi.ts';
import {WatchListSection} from "../components/WatchlistSection.tsx";

const isDefaultWatchList = (list: { isDefault?: boolean; name: string }) =>
  list.isDefault === true || list.name === 'Default';

const getWatchListNameWarning = (name: string) =>
{
  const trimmedName = name.trim();
  if (!trimmedName)
  {
    return 'Watchlist name cannot be empty.';
  }

  if (trimmedName.toLowerCase() === 'default')
  {
    return 'Default is reserved for the built-in watchlist.';
  }

  return null;
};

export function WatchListsPage()
{
  const {data: watchLists = [], isError, isFetching, isLoading, refetch} = useGetUserWatchListsQuery();
  const [createCustomWatchList, createState] = useCreateCustomWatchListMutation();
  const [deleteCustomWatchList, deleteState] = useDeleteCustomWatchListMutation();
  const [renameCustomWatchList, renameState] = useRenameCustomWatchListMutation();
  const [removeTitleFromDefaultWatchList, removeDefaultTitleState] = useRemoveTitleFromDefaultWatchListMutation();
  const [removeTitleFromWatchListById, removeTitleState] = useRemoveTitleFromWatchListByIdMutation();
  const [clearDefaultWatchList, clearDefaultState] = useClearDefaultWatchListMutation();
  const [clearWatchListById, clearState] = useClearWatchListByIdMutation();
  const [newListName, setNewListName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingListId, setDeletingListId] = useState<number | null>(null);
  const [renamingListId, setRenamingListId] = useState<number | null>(null);
  const [clearingListId, setClearingListId] = useState<number | null>(null);
  const [removingTitleKey, setRemovingTitleKey] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const trimmedListName = newListName.trim();
  const trimmedRenameValue = renameValue.trim();

  const handleCreateWatchList = async (event: FormEvent<HTMLFormElement>) =>
  {
    event.preventDefault();
    const warning = getWatchListNameWarning(newListName);
    if (warning)
    {
      setActionError(warning);
      return;
    }

    setActionError(null);
    try
    {
      await createCustomWatchList(trimmedListName).unwrap();
      setNewListName('');
      await refetch();
    } catch
    {
      setActionError('Unable to create the watchlist. Please try a different name.');
    }
  };

  const handleDeleteWatchList = async (watchListId: number, name: string) =>
  {
    const confirmed = window.confirm(`Delete "${name}"?`);
    if (!confirmed)
    {
      return;
    }

    setActionError(null);
    setDeletingListId(watchListId);
    try
    {
      await deleteCustomWatchList(watchListId).unwrap();
      await refetch();
    } catch
    {
      setActionError('Unable to delete this watchlist. Default watchlists cannot be removed.');
    } finally
    {
      setDeletingListId(null);
    }
  };

  const startRename = (watchListId: number, name: string) =>
  {
    setActionError(null);
    setRenamingListId(watchListId);
    setRenameValue(name);
  };

  const cancelRename = () =>
  {
    setRenamingListId(null);
    setRenameValue('');
  };

  const handleRenameWatchList = async (event: FormEvent<HTMLFormElement>, watchListId: number) =>
  {
    event.preventDefault();
    const warning = getWatchListNameWarning(renameValue);
    if (warning)
    {
      setActionError(warning);
      return;
    }

    setActionError(null);
    try
    {
      await renameCustomWatchList({watchListId, newName: trimmedRenameValue}).unwrap();
      cancelRename();
      await refetch();
    } catch
    {
      setActionError('Unable to rename this watchlist. Please try a different name.');
    }
  };

  const handleRemoveTitle = async (watchListId: number, titleId: number, titleName: string, isDefaultList: boolean) =>
  {
    const confirmed = window.confirm(`Remove "${titleName}" from this watchlist?`);
    if (!confirmed)
    {
      return;
    }

    const removingKey = `${watchListId}-${titleId}`;
    setActionError(null);
    setRemovingTitleKey(removingKey);
    try
    {
      if (isDefaultList)
      {
        await removeTitleFromDefaultWatchList(titleId).unwrap();
      } else
      {
        await removeTitleFromWatchListById({watchListId, titleId}).unwrap();
      }

      await refetch();
    } catch
    {
      setActionError('Unable to remove this title from the watchlist.');
    } finally
    {
      setRemovingTitleKey(null);
    }
  };

  const handleClearWatchList = async (watchListId: number, name: string, isDefaultList: boolean) =>
  {
    const confirmed = window.confirm(`Remove all titles from "${name}"?`);
    if (!confirmed)
    {
      return;
    }

    setActionError(null);
    setClearingListId(watchListId);
    try
    {
      if (isDefaultList)
      {
        await clearDefaultWatchList().unwrap();
      } else
      {
        await clearWatchListById(watchListId).unwrap();
      }

      await refetch();
    } catch
    {
      setActionError('Unable to clear this watchlist.');
    } finally
    {
      setClearingListId(null);
    }
  };

  const sortedWatchLists = [...watchLists].sort((left, right) =>
  {
    if (isDefaultWatchList(left))
    {
      return -1;
    }

    if (isDefaultWatchList(right))
    {
      return 1;
    }

    return 0;
  });

  return (
    <>
      <title>Watch Lists</title>
      <main className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Watchlists</p>
          </div>
          <div className="flex items-center gap-3">
            {isFetching ? <span className="text-sm text-muted">Updating...</span> : null}
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
                onChange={event =>
                {
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
            <button className="text-sm font-semibold text-primary hover:text-primary-strong" type="button"
                    onClick={refetch}>
              Try again
            </button>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(item => (
              <Card key={item} className="h-44 animate-pulse" tone="glass"/>
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && watchLists.length === 0 ? (
          <Card className="p-6" tone="glass">
            <p className="text-sm text-muted">Your watchlists are empty. Add titles from the catalog to start building a
              queue.</p>
          </Card>
        ) : null}

        <div className="space-y-6">
          {sortedWatchLists.map(list =>
          {
            const isDefaultList = isDefaultWatchList(list);
            const isRenamingThisList = renamingListId === list.id;

            return (
              <WatchListSection
                key={list.id}
                clearStateIsLoading={clearDefaultState.isLoading || clearState.isLoading}
                clearingListId={clearingListId}
                deleteStateIsLoading={deleteState.isLoading}
                deletingListId={deletingListId}
                isDefaultList={isDefaultList}
                isRenamingThisList={isRenamingThisList}
                list={list}
                removeStateIsLoading={removeDefaultTitleState.isLoading || removeTitleState.isLoading}
                removingTitleKey={removingTitleKey}
                renameStateIsLoading={renameState.isLoading}
                renameValue={renameValue}
                onCancelRename={cancelRename}
                onClear={(watchListId, name, defaultList) => void handleClearWatchList(watchListId, name, defaultList)}
                onDelete={(watchListId, name) => void handleDeleteWatchList(watchListId, name)}
                onRemoveTitle={(watchListId, titleId, titleName, defaultList) =>
                  void handleRemoveTitle(watchListId, titleId, titleName, defaultList)
                }
                onRename={(event, watchListId) => void handleRenameWatchList(event, watchListId)}
                onRenameValueChange={value =>
                {
                  setRenameValue(value);
                  setActionError(null);
                }}
                onStartRename={startRename}
              />
            );
          })}
        </div>
      </main>
    </>
  );
}
