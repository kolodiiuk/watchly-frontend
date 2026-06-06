import {useMemo} from 'react';
import {Button} from '../../../components/common/Button.tsx';

type WatchProgressButtonProps = {
  watchCount: number;
  itemLabel: string;
  onMarkWatched: () => Promise<void> | void;
  onUnwatch?: () => Promise<void> | void;
  isLoading?: boolean;
  isError?: boolean;
  disabled?: boolean;
  className?: string;
};

export function WatchProgressButton({
  watchCount,
  itemLabel,
  onMarkWatched,
  onUnwatch,
  isLoading = false,
  isError = false,
  disabled = false,
  className = ''
}: WatchProgressButtonProps)
{
  const isRewatch = watchCount > 0;
  const isDisabled = disabled || isLoading;
  const canUnwatch = Boolean(onUnwatch) && watchCount > 0;

  const buttonText = useMemo(() =>
  {
    if (isLoading)
    {
      return 'Saving...';
    }

    if (!isRewatch)
    {
      return `Mark ${itemLabel} as watched`;
    }

    return watchCount === 1 ? `Rewatch ${itemLabel}` : `Rewatch ${itemLabel} (${watchCount}x)`;
  }, [isLoading, isRewatch, itemLabel, watchCount]);

  const handleClick = async () =>
  {
    await onMarkWatched();
  };

  const handleUnwatch = async () =>
  {
    await onUnwatch?.();
  };

  return (
    <div className={className}>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Button type="button" variant="secondary" onClick={handleClick} disabled={isDisabled} className="w-full">
          {buttonText}
        </Button>
        {onUnwatch ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleUnwatch}
            disabled={isDisabled || !canUnwatch}
            className="w-full justify-center sm:w-auto">
            Unwatch
          </Button>
        ) : null}
      </div>
      {isError ? <p className="mt-2 text-sm text-danger">Could not update watch progress.</p> : null}
    </div>
  );
}
