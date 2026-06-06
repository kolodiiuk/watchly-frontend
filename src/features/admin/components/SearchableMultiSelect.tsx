import { Check, Search, X } from 'lucide-react';
import type { TitleReferenceOption } from '../models/types';

interface SearchableMultiSelectProps {
  label: string;
  placeholder: string;
  options: TitleReferenceOption[];
  selectedIds: number[];
  query: string;
  isLoading?: boolean;
  onQueryChange: (value: string) => void;
  onChange: (selectedIds: number[]) => void;
}

export function SearchableMultiSelect({
  label,
  placeholder,
  options,
  selectedIds,
  query,
  isLoading = false,
  onQueryChange,
  onChange,
}: SearchableMultiSelectProps) {
  const selectedSet = new Set(selectedIds);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleOptions = normalizedQuery
    ? options.filter(option => option.name.toLocaleLowerCase().includes(normalizedQuery))
    : options;
  const optionMap = new Map(options.map(option => [option.id, option]));
  const selectedOptions = selectedIds.flatMap(id => {
    const option = optionMap.get(id);
    return option ? [option] : [];
  });

  const toggle = (id: number) => {
    onChange(selectedSet.has(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id]);
  };

  return (
    <fieldset className="min-w-0 rounded-2xl border border-border/80 bg-background/25 p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</legend>
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          className="w-full rounded-xl border border-border bg-background/65 py-2 pl-9 pr-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label={`Search ${label.toLowerCase()}`}
        />
      </div>

      {selectedOptions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2" aria-label={`Selected ${label.toLowerCase()}`}>
          {selectedOptions.map(option => (
            <button
              key={option.id}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs font-medium text-text transition hover:border-primary hover:bg-primary/15"
              onClick={() => toggle(option.id)}
              aria-label={`Remove ${option.name}`}
            >
              {option.name}
              <X className="h-3 w-3 text-primary" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-border/70 bg-background/45 p-1">
        {isLoading ? <p className="px-3 py-2 text-sm text-muted">Loading options...</p> : null}
        {!isLoading && visibleOptions.length === 0 ? <p className="px-3 py-2 text-sm text-muted">No matches</p> : null}
        {!isLoading
          ? visibleOptions.map(option => {
              const isSelected = selectedSet.has(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    isSelected ? 'bg-primary/10 text-text' : 'text-muted hover:bg-surface-raised hover:text-text'
                  }`}
                  onClick={() => toggle(option.id)}
                  aria-pressed={isSelected}
                >
                  <span>{option.name}</span>
                  {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                </button>
              );
            })
          : null}
      </div>
    </fieldset>
  );
}
