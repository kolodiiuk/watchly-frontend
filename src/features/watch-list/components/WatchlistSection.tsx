import {type FormEvent, useState} from "react";
import {Badge} from "../../../components/common/Badge.tsx";
import {Card} from "../../../components/common/Card.tsx";
import {Button} from "../../../components/common/Button.tsx";
import type {WatchListInfo} from "../models/WatchListInfo.ts";
import {Link} from "react-router-dom";
import {PencilIcon} from "../../../components/icons/PencilIcon";
import {ChevronIcon} from "../../../components/icons/ChevronIcon";
import {TrashIcon} from "../../../components/icons/TrashIcon";

const getPosterUrl = (path: string) => `https://image.tmdb.org/t/p/w342${path}`;

type WatchListViewMode = 'cards' | 'list';

interface WatchListSectionProps {
  list: WatchListInfo;
  isDefaultList: boolean;
  isRenamingThisList: boolean;
  renameValue: string;
  renameStateIsLoading: boolean;
  deleteStateIsLoading: boolean;
  clearStateIsLoading: boolean;
  removeStateIsLoading: boolean;
  deletingListId: number | null;
  clearingListId: number | null;
  removingTitleKey: string | null;
  onStartRename: (watchListId: number, name: string) => void;
  onCancelRename: () => void;
  onRenameValueChange: (value: string) => void;
  onRename: (event: FormEvent<HTMLFormElement>, watchListId: number) => void;
  onDelete: (watchListId: number, name: string) => void;
  onClear: (watchListId: number, name: string, isDefaultList: boolean) => void;
  onRemoveTitle: (watchListId: number, titleId: number, titleName: string, isDefaultList: boolean) => void;
}

export function WatchListSection({
                            list,
                            isDefaultList,
                            isRenamingThisList,
                            renameValue,
                            renameStateIsLoading,
                            deleteStateIsLoading,
                            clearStateIsLoading,
                            removeStateIsLoading,
                            deletingListId,
                            clearingListId,
                            removingTitleKey,
                            onStartRename,
                            onCancelRename,
                            onRenameValueChange,
                            onRename,
                            onDelete,
                            onClear,
                            onRemoveTitle,
                          }: WatchListSectionProps) {
  const [viewMode, setViewMode] = useState<WatchListViewMode>('cards');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const titles = list.titles ?? [];

  const viewButtonClass = (mode: WatchListViewMode) =>
    [
      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
      viewMode === mode ? 'bg-primary text-background' : 'text-muted hover:bg-white/5 hover:text-text',
    ].join(' ');

  return (
    <section
      className={[
        'space-y-4 rounded-3xl border p-4 sm:p-5',
        isDefaultList
          ? 'border-primary/40 bg-primary/10 shadow-[0_18px_60px_rgba(245,196,81,0.08)]'
          : 'border-transparent bg-transparent p-0 sm:p-0',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isRenamingThisList ? (
          <form
            className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={event => onRename(event, list.id)}
          >
            <input
              autoFocus
              className="min-w-60 flex-1 rounded-2xl border border-border bg-background/60 px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
              maxLength={80}
              type="text"
              value={renameValue}
              onChange={event => onRenameValueChange(event.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={renameStateIsLoading}>
                {renameStateIsLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="ghost" onClick={onCancelRename}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-text">{list.name}</h2>
              {isDefaultList ? (
                <Badge className="tracking-[0.12em]" tone="warning">
                  Default
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted">
              {titles.length} {titles.length === 1 ? 'title' : 'titles'}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {titles.length > 0 && !isCollapsed ? (
            <div className="flex rounded-full border border-border bg-background/40 p-1">
              <button className={viewButtonClass('cards')} type="button" onClick={() => setViewMode('cards')}>
                Cards
              </button>
              <button className={viewButtonClass('list')} type="button" onClick={() => setViewMode('list')}>
                List
              </button>
            </div>
          ) : null}

          <Button
            leadingIcon={<ChevronIcon direction={isCollapsed ? 'down' : 'up'} />}
            type="button"
            variant="ghost"
            onClick={() => setIsCollapsed(current => !current)}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>

          {!isDefaultList && !isRenamingThisList ? (
            <>
              <Button
                leadingIcon={<PencilIcon />}
                type="button"
                variant="secondary"
                onClick={() => onStartRename(list.id, list.name)}
              >
                Rename
              </Button>
              {titles.length > 0 ? (
                <Button
                  disabled={clearingListId === list.id && clearStateIsLoading}
                  type="button"
                  variant="secondary"
                  onClick={() => onClear(list.id, list.name, isDefaultList)}
                >
                  {clearingListId === list.id ? 'Clearing...' : 'Clear'}
                </Button>
              ) : null}
              <Button
                className="border-danger/40 text-danger hover:bg-danger/10 hover:text-danger"
                disabled={deleteStateIsLoading && deletingListId === list.id}
                leadingIcon={<TrashIcon />}
                type="button"
                variant="secondary"
                onClick={() => onDelete(list.id, list.name)}
              >
                {deleteStateIsLoading && deletingListId === list.id ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : null}

          {isDefaultList && titles.length > 0 ? (
            <Button
              disabled={clearingListId === list.id && clearStateIsLoading}
              type="button"
              variant="secondary"
              onClick={() => onClear(list.id, list.name, isDefaultList)}
            >
              {clearingListId === list.id ? 'Clearing...' : 'Clear'}
            </Button>
          ) : null}
        </div>
      </div>

      {isCollapsed ? null : titles.length === 0 ? (
        <Card className="p-5" tone="glass">
          <p className="text-sm text-muted">No titles in this list yet.</p>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {titles.map(title => {
            const titleKey = `${list.id}-${title.id}`;
            const isRemoving = removingTitleKey === titleKey && removeStateIsLoading;

            return (
              <Card key={title.id} className="flex h-full flex-col p-4 transition hover:border-primary/50" tone="base">
                <Link to={`/title/${title.id}`} className="group">
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
                </Link>
                <div className="mt-4 flex flex-1 flex-col gap-4">
                  <Link to={`/title/${title.id}`} className="group">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-text group-hover:text-primary">{title.name}</h3>
                      {title.avgTmdbRating != null ? (
                        <Badge className="shrink-0" tone="success">
                          {title.avgTmdbRating.toFixed(1)}
                        </Badge>
                      ) : null}
                    </div>
                  </Link>
                  <div className="mt-auto">
                    <Button
                      className="w-full justify-center border-danger/40 text-danger hover:bg-danger/10 hover:text-danger"
                      disabled={isRemoving}
                      type="button"
                      variant="secondary"
                      onClick={() => onRemoveTitle(list.id, title.id, title.name, isDefaultList)}
                    >
                      {isRemoving ? 'Removing...' : 'Remove'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <ol className="overflow-hidden rounded-2xl border border-border bg-surface/70">
          {titles.map((title, index) => {
            const titleKey = `${list.id}-${title.id}`;
            const isRemoving = removingTitleKey === titleKey && removeStateIsLoading;

            return (
              <li
                key={title.id}
                className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 border-b border-border/70 px-4 py-3 last:border-b-0 sm:grid-cols-[2.5rem_1fr_auto_auto]"
              >
                <span className="text-sm font-semibold text-muted">{index + 1}</span>
                <Link className="min-w-0 font-semibold text-text hover:text-primary" to={`/title/${title.id}`}>
                  <span className="block truncate">{title.name}</span>
                </Link>
                {title.avgTmdbRating != null ? (
                  <Badge className="shrink-0" tone="success">
                    {title.avgTmdbRating.toFixed(1)}
                  </Badge>
                ) : (
                  <span className="hidden text-sm text-muted sm:block">No rating</span>
                )}
                <Button
                  className="col-start-2 w-fit border-danger/40 px-3 py-1.5 text-danger hover:bg-danger/10 hover:text-danger sm:col-start-auto"
                  disabled={isRemoving}
                  type="button"
                  variant="secondary"
                  onClick={() => onRemoveTitle(list.id, title.id, title.name, isDefaultList)}
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </Button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
