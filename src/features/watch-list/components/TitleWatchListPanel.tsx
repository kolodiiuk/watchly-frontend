import {type ChangeEvent, useMemo, useState} from 'react';
import {BookmarkCheck, ListPlus, LoaderCircle, Sparkles} from 'lucide-react';
import {Button} from '../../../components/common/Button.tsx';
import {
  useAddTitleToDefaultWatchListMutation,
  useAddTitleToWatchListByIdMutation,
  useGetUserWatchListsQuery,
  useGetWatchListsWithTitleQuery,
  useRemoveTitleFromDefaultWatchListMutation,
  useRemoveTitleFromWatchListByIdMutation,
} from '../api/watchListApi.ts';

interface TitleWatchListPanelProps {
  titleId: number;
  titleName: string;
  isAuthenticated: boolean;
}

const DEFAULT_WATCHLIST_NAME = 'Default';
const DEFAULT_WATCHLIST_FALLBACK_ID = -1;

const isDefaultWatchList = (list: {isDefault?: boolean; name: string}) =>
  list.isDefault === true || list.name === DEFAULT_WATCHLIST_NAME;

export function TitleWatchListPanel({titleId, titleName, isAuthenticated}: TitleWatchListPanelProps)
{
  const [panelError, setPanelError] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [selectedWatchListId, setSelectedWatchListId] = useState<number | null>(null);
  const {data: watchLists = [], isLoading: isListsLoading, isFetching: isListsFetching, isError: isListsError} =
    useGetUserWatchListsQuery(undefined, {skip: !isAuthenticated});
  const {data: listsWithTitle = [], isLoading: isMembershipLoading, isFetching: isMembershipFetching} =
    useGetWatchListsWithTitleQuery(titleId, {skip: !isAuthenticated});
  const [addTitleToDefaultWatchList, addDefaultState] = useAddTitleToDefaultWatchListMutation();
  const [removeTitleFromDefaultWatchList, removeDefaultState] = useRemoveTitleFromDefaultWatchListMutation();
  const [addTitleToWatchListById, addListState] = useAddTitleToWatchListByIdMutation();
  const [removeTitleFromWatchListById, removeListState] = useRemoveTitleFromWatchListByIdMutation();

  const membershipIds = useMemo(() => new Set(listsWithTitle.map(list => list.id)), [listsWithTitle]);
  const availableWatchLists = useMemo(() =>
  {
    if (watchLists.some(isDefaultWatchList))
    {
      return watchLists;
    }

    const defaultMembership = listsWithTitle.find(isDefaultWatchList);
    return [
      {
        id: defaultMembership?.id ?? DEFAULT_WATCHLIST_FALLBACK_ID,
        name: DEFAULT_WATCHLIST_NAME,
        titles: [],
        isDefault: true,
      },
      ...watchLists,
    ];
  }, [listsWithTitle, watchLists]);
  const sortedWatchLists = useMemo(
    () => [...availableWatchLists].sort((left, right) =>
    {
      if (isDefaultWatchList(left))
      {
        return -1;
      }

      if (isDefaultWatchList(right))
      {
        return 1;
      }

      return left.name.localeCompare(right.name);
    }),
    [availableWatchLists],
  );
  const defaultList = sortedWatchLists.find(isDefaultWatchList) ?? null;
  const selectedWatchList =
    sortedWatchLists.find(list => list.id === selectedWatchListId) ??
    sortedWatchLists.find(list => !membershipIds.has(list.id)) ??
    sortedWatchLists[0] ??
    null;
  const isSelectedInList = selectedWatchList ? membershipIds.has(selectedWatchList.id) : false;
  const isMutating =
    addDefaultState.isLoading ||
    removeDefaultState.isLoading ||
    addListState.isLoading ||
    removeListState.isLoading;
  const isBusy = isListsFetching || isMembershipFetching || isMutating;

  const handleToggleMembership = async (watchListId: number, isInList: boolean) =>
  {
    setPanelError(null);
    setActiveListId(watchListId);

    try
    {
      if (defaultList && watchListId === defaultList.id)
      {
        if (isInList)
        {
          await removeTitleFromDefaultWatchList(titleId).unwrap();
        } else
        {
          await addTitleToDefaultWatchList(titleId).unwrap();
        }

        return;
      }

      if (isInList)
      {
        await removeTitleFromWatchListById({watchListId, titleId}).unwrap();
      } else
      {
        await addTitleToWatchListById({watchListId, titleId}).unwrap();
      }
    } catch
    {
      setPanelError(`Could not update watchlist for "${titleName}".`);
    } finally
    {
      setActiveListId(null);
    }
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) =>
  {
    const nextId = Number(event.target.value);
    setSelectedWatchListId(Number.isNaN(nextId) ? null : nextId);
    setPanelError(null);
  };

  if (!isAuthenticated)
  {
    return (
      <div className="rounded-[1.75rem] border border-border/80 bg-background/25 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-border/80 bg-background/55 p-2 text-muted">
            <BookmarkCheck className="h-4 w-4"/>
          </div>
          <span className="text-sm font-semibold text-muted">Sign in for watchlists</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-border/80 bg-background/25 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[15rem] flex-1">
          <label className="sr-only" htmlFor={`watchlist-select-${titleId}`}>Choose watchlist</label>
          <div className="relative">
            <select
              id={`watchlist-select-${titleId}`}
              className="w-full appearance-none rounded-full border border-border bg-background/60 px-4 py-2.5 pr-11 text-sm font-medium text-text outline-none transition focus:border-primary"
              disabled={!sortedWatchLists.length || isBusy}
              value={selectedWatchList?.id ?? ''}
              onChange={handleSelectChange}
            >
              {sortedWatchLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name}{membershipIds.has(list.id) ? ' • saved' : ''}
                </option>
              ))}
            </select>
            <Sparkles className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"/>
          </div>
        </div>

        <Button
          className="min-w-[9rem] justify-center"
          disabled={!selectedWatchList || isBusy}
          leadingIcon={
            activeListId === selectedWatchList?.id && isMutating ? <LoaderCircle className="h-4 w-4 animate-spin"/> :
              isSelectedInList ? <BookmarkCheck className="h-4 w-4"/> :
                <ListPlus className="h-4 w-4"/>
          }
          type="button"
          variant="secondary"
          onClick={() => selectedWatchList ? handleToggleMembership(selectedWatchList.id, isSelectedInList) : undefined}
        >
          {isSelectedInList ? 'Remove' : 'Add'}
        </Button>
      </div>

      {panelError ? <p className="mt-3 text-sm text-danger">{panelError}</p> : null}

      {isListsError ? <p className="mt-3 text-sm text-danger">Could not load watchlists.</p> : null}
      {(isListsLoading || isMembershipLoading) && !sortedWatchLists.length ? (
        <div className="mt-3 h-11 animate-pulse rounded-full border border-border/70 bg-background/35"/>
      ) : null}
    </div>
  );
}
