import type { ChangeEvent } from 'react';
import { fieldError } from '../services/validation';
import type { AdminTitleFormValues } from '../models/types';
import type { ValidationErrors } from '../services/validation';

interface TitleBaseFieldsProps {
  values: AdminTitleFormValues;
  errors?: ValidationErrors;
  onChange: (patch: Partial<AdminTitleFormValues>) => void;
}

const inputClass =
  'rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40';

export function TitleBaseFields({ values, errors = {}, onChange }: TitleBaseFieldsProps) {
  const handleTextChange =
    (field: keyof AdminTitleFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [field]: event.target.value } as Partial<AdminTitleFormValues>);

  const handleAdultChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ isAdult: event.target.checked });
  };

  const handlePosterFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ posterFile: event.target.files?.[0] ?? null });
  };

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-text">Base fields</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Name</span>
          <input className={inputClass} value={values.name} onChange={handleTextChange('name')} placeholder="Name" />
          {fieldError(errors, 'name') ? <span className="text-xs text-danger">{fieldError(errors, 'name')}</span> : null}
        </label>

        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Poster URL</span>
          <input className={inputClass} value={values.posterUrl} onChange={handleTextChange('posterUrl')} placeholder="https://..." />
        </label>

        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Release date</span>
          <input className={inputClass} type="date" value={values.releaseDate} onChange={handleTextChange('releaseDate')} />
        </label>

        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Runtime</span>
          <input className={inputClass} type="number" min="0" value={values.runtime} onChange={handleTextChange('runtime')} placeholder="Runtime (minutes)" />
          {fieldError(errors, 'runtime') ? <span className="text-xs text-danger">{fieldError(errors, 'runtime')}</span> : null}
        </label>

        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Tagline</span>
          <input className={inputClass} value={values.tagline} onChange={handleTextChange('tagline')} placeholder="Tagline" />
        </label>

        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Director</span>
          <input className={inputClass} value={values.director} onChange={handleTextChange('director')} placeholder="Director" />
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Actors</span>
          <input className={inputClass} value={values.actors} onChange={handleTextChange('actors')} placeholder="Actors (comma separated)" />
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Overview</span>
          <textarea
            className="min-h-24 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={values.overview}
            onChange={handleTextChange('overview')}
            placeholder="Overview"
          />
          {fieldError(errors, 'overview') ? <span className="text-xs text-danger">{fieldError(errors, 'overview')}</span> : null}
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Poster file</span>
          <input className={inputClass} type="file" accept="image/*" onChange={handlePosterFileChange} />
          <span className="text-xs text-muted">
            {values.posterFile ? `Selected: ${values.posterFile.name}` : 'Optional. If provided, the file will be uploaded after save.'}
          </span>
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-text">
        <input type="checkbox" className="h-4 w-4 rounded border-border bg-background/50" checked={values.isAdult} onChange={handleAdultChange} />
        Adult content
      </label>
    </section>
  );
}
