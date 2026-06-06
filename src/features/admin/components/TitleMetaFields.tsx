import type { ChangeEvent } from 'react';
import { fieldError } from '../services/validation';
import type { AdminTitleFormValues } from '../models/types';
import type { ValidationErrors } from '../services/validation';

interface TitleMetaFieldsProps {
  values: AdminTitleFormValues;
  errors?: ValidationErrors;
  onChange: (patch: Partial<AdminTitleFormValues>) => void;
}

const inputClass =
  'rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40';

export function TitleMetaFields({ values, errors = {}, onChange }: TitleMetaFieldsProps) {
  const handleTextChange = (field: keyof AdminTitleFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: event.target.value } as Partial<AdminTitleFormValues>);
  };

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-text">Metadata</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Languages</span>
          <input
            className={inputClass}
            value={values.localizationLanguages}
            onChange={handleTextChange('localizationLanguages')}
            placeholder="English, Spanish"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Homepage</span>
          <input className={inputClass} value={values.homePage} onChange={handleTextChange('homePage')} placeholder="https://..." />
        </label>
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">TMDB rating</span>
          <input
            className={inputClass}
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={values.avgTmdbRating}
            onChange={handleTextChange('avgTmdbRating')}
            placeholder="0.0 - 10.0"
          />
          {fieldError(errors, 'avgTmdbRating') ? (
            <span className="text-xs text-danger">{fieldError(errors, 'avgTmdbRating')}</span>
          ) : null}
        </label>
      </div>
    </section>
  );
}
