import { useDeferredValue, useState } from 'react';
import { useGetTitleReferenceOptionsQuery } from '../api/adminContentApi';
import type { AdminTitleFormValues } from '../models/types';
import { SearchableMultiSelect } from './SearchableMultiSelect';

interface TitleRelationsFieldsProps {
  values: AdminTitleFormValues;
  onChange: (patch: Partial<AdminTitleFormValues>) => void;
}

export function TitleRelationsFields({ values, onChange }: TitleRelationsFieldsProps) {
  const [genreQuery, setGenreQuery] = useState('');
  const [languageQuery, setLanguageQuery] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const deferredCompanyQuery = useDeferredValue(companyQuery.trim());
  const { data, isFetching, isError } = useGetTitleReferenceOptionsQuery({
    productionCompanyTerm: deferredCompanyQuery,
    selectedProductionCompanyIds: values.productionCompanyIds,
  });

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-text">Catalog relationships</h3>
        <p className="mt-1 text-xs text-muted">Choose existing catalog records. Multiple selections allowed.</p>
      </div>
      {isError ? <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">Could not load catalog options.</p> : null}
      <div className="grid gap-3 lg:grid-cols-3">
        <SearchableMultiSelect
          label="Genres"
          placeholder="Search genres"
          options={data?.genres ?? []}
          selectedIds={values.genreIds}
          query={genreQuery}
          isLoading={isFetching && !data}
          onQueryChange={setGenreQuery}
          onChange={genreIds => onChange({ genreIds })}
        />
        <SearchableMultiSelect
          label="Spoken languages"
          placeholder="Search languages"
          options={data?.spokenLanguages ?? []}
          selectedIds={values.spokenLanguageIds}
          query={languageQuery}
          isLoading={isFetching && !data}
          onQueryChange={setLanguageQuery}
          onChange={spokenLanguageIds => onChange({ spokenLanguageIds })}
        />
        <SearchableMultiSelect
          label="Production companies"
          placeholder="Search companies"
          options={data?.productionCompanies ?? []}
          selectedIds={values.productionCompanyIds}
          query={companyQuery}
          isLoading={isFetching}
          onQueryChange={setCompanyQuery}
          onChange={productionCompanyIds => onChange({ productionCompanyIds })}
        />
      </div>
    </section>
  );
}
