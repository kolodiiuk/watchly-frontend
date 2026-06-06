import {type ChangeEvent, useState} from 'react';
import {
  useGetTitleWatchStatusQuery,
  useSetTitleWatchStatusMutation
} from '../api/watchTrackingApi.ts';
import {WatchStatus, type WatchStatus as WatchStatusValue} from '../models/WatchStatus.ts';

type TitleWatchStatusSelectorProps = {
  titleId: number;
  isAuthenticated: boolean;
  hasValidTitleId: boolean;
};

const watchStatusOptions = [
  {value: WatchStatus.PlanToWatch, label: 'Plan to watch'},
  {value: WatchStatus.Watching, label: 'Watching'},
  {value: WatchStatus.Completed, label: 'Completed'},
  {value: WatchStatus.Dropped, label: 'Dropped'},
  {value: WatchStatus.NotWatched, label: 'Not watched'},
];

export function TitleWatchStatusSelector({
  titleId,
  isAuthenticated,
  hasValidTitleId
}: TitleWatchStatusSelectorProps)
{
  const [localWatchStatus, setLocalWatchStatus] = useState<WatchStatusValue | null>(null);
  const [watchStatusError, setWatchStatusError] = useState<string | null>(null);
  const {
    data: watchStatus,
    isFetching: isWatchStatusFetching,
    isError: isWatchStatusError
  } = useGetTitleWatchStatusQuery(titleId, {skip: !isAuthenticated || !hasValidTitleId});
  const [setTitleWatchStatus, {isLoading: isSettingWatchStatus}] = useSetTitleWatchStatusMutation();
  const selectedWatchStatus = localWatchStatus ?? watchStatus ?? WatchStatus.PlanToWatch;
  const effectiveError = watchStatusError ?? (isWatchStatusError ? 'Could not load your watch status.' : null);

  const onWatchStatusSelect = async (event: ChangeEvent<HTMLSelectElement>) =>
  {
    const nextStatus = Number(event.target.value) as WatchStatusValue;
    setWatchStatusError(null);

    try
    {
      await setTitleWatchStatus({titleId, status: nextStatus}).unwrap();
      setLocalWatchStatus(nextStatus);
    } catch
    {
      setWatchStatusError('Could not update watch status.');
    }
  };

  return (
    <>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">Status</span>
        <select
          value={selectedWatchStatus}
          onChange={onWatchStatusSelect}
          disabled={isWatchStatusFetching || isSettingWatchStatus}
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text disabled:opacity-70">
          {watchStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      {effectiveError ? <p className="mt-2 text-sm text-danger">{effectiveError}</p> : null}
    </>
  );
}
