import type { ChangeEvent } from 'react';
import type { AdminTitleTypeFilter } from './types';

interface TitleTypeSwitchProps {
  value?: Exclude<AdminTitleTypeFilter, 'all'>;
  onChange?: (value: Exclude<AdminTitleTypeFilter, 'all'>) => void;
}

export function TitleTypeSwitch({ value = 'movie', onChange }: TitleTypeSwitchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value as 'movie' | 'series');

  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-[0.16em] text-muted">Title type</legend>
      <div className="mt-2 inline-flex rounded-xl border border-border bg-background/50 p-1">
        <label className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-text has-[:checked]:bg-surface-raised">
          <input className="sr-only" type="radio" name="titleType" value="movie" checked={value === 'movie'} onChange={handleChange} />
          Movie
        </label>
        <label className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-text has-[:checked]:bg-surface-raised">
          <input className="sr-only" type="radio" name="titleType" value="series" checked={value === 'series'} onChange={handleChange} />
          TV Show
        </label>
      </div>
    </fieldset>
  );
}
