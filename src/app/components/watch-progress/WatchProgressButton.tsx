import {useMemo, useState} from 'react';
import {Button} from '../../../components/ui/Button.tsx';

type WatchProgressButtonProps = {
  userId: string;
  itemLabel: string;
  onMarkWatched?: (watchCount: number, userId: string) => void;
  disabled?: boolean;
  className?: string;
};

export function WatchProgressButton({userId, itemLabel, onMarkWatched, disabled = false, className = ''}: WatchProgressButtonProps)
{
  const [watchCount, setWatchCount] = useState(0);
  const isRewatch = watchCount > 0;

  const buttonText = useMemo(() =>
  {
    if (!isRewatch)
    {
      return `Mark ${itemLabel} as watched`;
    }

    return watchCount === 1 ? `Rewatch ${itemLabel}` : `Rewatch ${itemLabel} (${watchCount}x)`;
  }, [isRewatch, itemLabel, watchCount]);

  const handleClick = () =>
  {
    const nextWatchCount = watchCount + 1;
    setWatchCount(nextWatchCount);
    onMarkWatched?.(nextWatchCount, userId);
  };

  return (
    <Button type="button" variant="secondary" onClick={handleClick} disabled={disabled} className={className}>
      {buttonText}
    </Button>
  );
}
