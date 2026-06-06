import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { catalogApi, useFilterTitlesQuery, useSearchTitlesQuery, useGetTitleQuery } from '../../catalog/api/catalogApi';
import { SortBy } from '../../catalog/models/types';
import type { TitleInfo, TitleShortInfo } from '../../titles-details/models/TitleInfo';
import { TitleType } from '../../titles-details/models/TitleType';
import { useAuth } from '../../auth/services/AuthProvider';
import { UserRole } from '../../auth/models/UserRole';
import {
  useAddTitleMutation,
  useSoftDeleteTitleMutation,
  useUpdateTitleMutation,
  useUploadPosterMutation,
} from '../api/adminContentApi';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { EmptyState } from '../components/EmptyState';
import { InlineErrorNotice } from '../components/InlineErrorNotice';
import { InlineSuccessNotice } from '../components/InlineSuccessNotice';
import { LoadingState } from '../components/LoadingState';
import { TitleFormModal } from '../components/TitleFormModal';
import { TitlesTable } from '../components/TitlesTable';
import { TitlesToolbar } from '../components/TitlesToolbar';
import { UnauthorizedFallback } from '../components/UnauthorizedFallback';
import type {
  AdminEditableTitleType,
  AdminSortOption,
  AdminTitleFormValues,
  AdminTitleRow,
  CreateTitleRequest,
  UpdateTitleRequest,
} from '../models/types';
import { validateNonNegativeNumber, validateRequired } from '../services/validation';
import type { ValidationErrors } from '../services/validation';

type TitleModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  titleId: number | null;
  initialValues: AdminTitleFormValues;
};

type DeleteState =
  | {
      targetType: 'title';
      id: number;
      name: string;
    }
  | null;

const emptyTitleFormValues = (titleType: AdminEditableTitleType = 'movie'): AdminTitleFormValues => ({
  name: '',
  overview: '',
  titleType,
  runtime: '',
  isAdult: false,
  releaseDate: '',
  posterUrl: '',
  posterFile: null,
  tagline: '',
  director: '',
  actors: '',
  localizationLanguages: '',
  homePage: '',
  avgTmdbRating: '',
  genreIds: [],
  spokenLanguageIds: [],
  productionCompanyIds: [],
});

const toEditableTitleType = (titleType: TitleInfo['titleType']): AdminEditableTitleType =>
  titleType === TitleType.Series ? 'series' : 'movie';

const toApiTitleType = (titleType: AdminEditableTitleType) =>
  titleType === 'series' ? TitleType.Series : TitleType.Movie;

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Unscheduled';
  }

  return value.slice(0, 10);
};

const toDateInputValue = (value?: string | null) => {
  const formattedDate = formatDate(value);
  return formattedDate === 'Unscheduled' ? '' : formattedDate;
};

const parseInteger = (value: string) => Number.parseInt(value, 10);
const parseFloatValue = (value: string) => Number.parseFloat(value);

const mapTitleShortInfoToRow = (title: TitleShortInfo): AdminTitleRow => ({
  id: title.id,
  name: title.name,
  type: toEditableTitleType(title.titleType),
  releaseDate: formatDate(title.releaseDate),
  rating: title.avgTmdbRating ?? 0,
});

const mapTitleInfoToFormValues = (title: TitleInfo, fallbackReleaseDate?: string): AdminTitleFormValues => ({
  name: title.name,
  overview: title.overview ?? '',
  titleType: toEditableTitleType(title.titleType),
  runtime: String(title.runtime),
  isAdult: title.isAdult,
  releaseDate: toDateInputValue(title.releaseDate ?? fallbackReleaseDate),
  posterUrl: title.posterUrl ?? '',
  posterFile: null,
  tagline: title.tagline ?? '',
  director: title.director ?? '',
  actors: title.actors ?? '',
  localizationLanguages: title.localizationLanguages ?? '',
  homePage: '',
  avgTmdbRating: title.avgTmdbRating == null ? '' : String(title.avgTmdbRating),
  genreIds: title.genreIds ?? [],
  spokenLanguageIds: title.spokenLanguageIds ?? [],
  productionCompanyIds: title.productionCompanyIds ?? [],
});

const sortRows = (rows: AdminTitleRow[], sort: AdminSortOption) =>
  rows.slice().sort((left, right) => {
    if (sort === 'name') {
      return left.name.localeCompare(right.name);
    }

    if (sort === 'releaseDate') {
      return right.releaseDate.localeCompare(left.releaseDate);
    }

    return right.rating - left.rating;
  });

const isNotFoundError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404;

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    if ('data' in error) {
      const data = (error as { data?: { detail?: string; title?: string } }).data;
      if (data?.detail) {
        return data.detail;
      }
      if (data?.title) {
        return data.title;
      }
    }

    if ('error' in error && typeof (error as { error?: string }).error === 'string') {
      return (error as { error: string }).error;
    }
  }

  return 'An unexpected error occurred.';
};

const validateTitleForm = (values: AdminTitleFormValues) => {
  const errors: ValidationErrors = {};
  const runtime = parseInteger(values.runtime);
  const rating = values.avgTmdbRating.trim() ? parseFloatValue(values.avgTmdbRating) : Number.NaN;

  const nameError = validateRequired(values.name, 'Name');
  if (nameError) {
    errors.name = nameError;
  }

  const overviewError = validateRequired(values.overview, 'Overview');
  if (overviewError) {
    errors.overview = overviewError;
  }

  const runtimeError = values.runtime.trim()
    ? validateNonNegativeNumber(runtime, 'Runtime')
    : 'Runtime is required.';
  if (runtimeError) {
    errors.runtime = runtimeError;
  }

  if (values.avgTmdbRating.trim() && (!Number.isFinite(rating) || rating < 0 || rating > 10)) {
    errors.avgTmdbRating = 'TMDB rating must be between 0 and 10.';
  }

  return errors;
};

const buildCreateTitleRequest = (values: AdminTitleFormValues): CreateTitleRequest => ({
  name: values.name.trim(),
  overview: values.overview.trim(),
  contentType: toApiTitleType(values.titleType),
  runtime: parseInteger(values.runtime),
  isAdult: values.isAdult,
  releaseDate: values.releaseDate.trim() || null,
  posterUrl: values.posterUrl.trim() || null,
  tagline: values.tagline.trim() || null,
  director: values.director.trim() || null,
  actors: values.actors.trim() || null,
  localizationLanguages: values.localizationLanguages.trim() || null,
  homePage: values.homePage.trim() || null,
  avgTmdbRating: values.avgTmdbRating.trim() ? parseFloatValue(values.avgTmdbRating) : null,
  genreIds: values.genreIds,
  spokenLanguageIds: values.spokenLanguageIds,
  productionCompanyIds: values.productionCompanyIds,
});

const buildUpdateTitleRequest = (values: AdminTitleFormValues): UpdateTitleRequest => ({
  name: values.name.trim(),
  overview: values.overview.trim(),
  contentType: toApiTitleType(values.titleType),
  runtime: parseInteger(values.runtime),
  isAdult: values.isAdult,
  releaseDate: values.releaseDate.trim() || null,
  tagline: values.tagline.trim() || null,
  director: values.director.trim() || null,
  actors: values.actors.trim() || null,
  localizationLanguages: values.localizationLanguages.trim() || null,
  homePage: values.homePage.trim() || null,
  avgTmdbRating: values.avgTmdbRating.trim() ? parseFloatValue(values.avgTmdbRating) : null,
  genreIds: values.genreIds,
  spokenLanguageIds: values.spokenLanguageIds,
  productionCompanyIds: values.productionCompanyIds,
});

interface AdminContentPageProps {
  contentType: AdminEditableTitleType;
}

export function AdminContentPage({ contentType }: AdminContentPageProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN;
  const apiTitleType = toApiTitleType(contentType);
  const pageTitle = contentType === 'movie' ? 'Movies' : 'TV Series';

  const [searchValue, setSearchValue] = useState('');
  const [submittedSearchValue, setSubmittedSearchValue] = useState('');
  const [selectedSort, setSelectedSort] = useState<AdminSortOption>('name');
  const [selectedTitleId, setSelectedTitleId] = useState<number | null>(null);

  const [titleModal, setTitleModal] = useState<TitleModalState>({
    isOpen: false,
    mode: 'create',
    titleId: null,
    initialValues: emptyTitleFormValues(contentType),
  });
  const [titleFormErrors, setTitleFormErrors] = useState<ValidationErrors>({});

  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const hasSearch = submittedSearchValue.length > 0;

  const [triggerGetTitle] = catalogApi.useLazyGetTitleQuery();

  const {
    data: searchResults,
    error: searchError,
    isFetching: isFetchingSearch,
    refetch: refetchSearchResults,
  } = useSearchTitlesQuery({
    term: submittedSearchValue,
    page: 1,
    pageSize: 50,
    titleTypes: [apiTitleType],
  }, {
    skip: !hasSearch,
  });

  const {
    data: filterResults,
    error: filterError,
    isFetching: isFetchingFilter,
    refetch: refetchFilterResults,
  } = useFilterTitlesQuery({
    page: 1,
    size: 50,
    sortBy: SortBy.Id,
    titleTypes: [apiTitleType],
  }, {
    skip: hasSearch,
  });

  const {
    data: selectedTitle,
    error: selectedTitleError,
    refetch: refetchSelectedTitle,
  } = useGetTitleQuery(selectedTitleId ?? 0, {
    skip: selectedTitleId === null,
  });

  const [addTitle, { isLoading: isAddingTitle }] = useAddTitleMutation();
  const [updateTitle, { isLoading: isUpdatingTitle }] = useUpdateTitleMutation();
  const [uploadPoster, { isLoading: isUploadingPoster }] = useUploadPosterMutation();
  const [softDeleteTitle, { isLoading: isDeletingTitle }] = useSoftDeleteTitleMutation();

  const activeResults = hasSearch ? searchResults : filterResults;
  const activeSearchError = hasSearch ? searchError : filterError;
  const titleRowsSource = isNotFoundError(activeSearchError) ? [] : activeResults ?? [];

  const filteredRows = titleRowsSource
    .map(mapTitleShortInfoToRow)
    .filter(row => row.type === contentType);
  const titleRows = sortRows(filteredRows, selectedSort);

  const isLoadingTitles = hasSearch ? isFetchingSearch : isFetchingFilter;
  const hasNoResults = !isLoadingTitles && titleRows.length === 0;
  const isSubmittingTitleForm = isAddingTitle || isUpdatingTitle || isUploadingPoster;
  const isSubmittingDelete = isDeletingTitle;

  const clearNotices = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSearchSubmit = () => {
    setSubmittedSearchValue(searchValue.trim());
    setSelectedTitleId(null);
    clearNotices();
  };

  const refreshCurrentData = async () => {
    if (hasSearch) {
      await refetchSearchResults();
    } else {
      await refetchFilterResults();
    }

    if (selectedTitleId !== null) {
      await refetchSelectedTitle();
    }
  };

  const openCreateTitleModal = () => {
    clearNotices();
    setTitleFormErrors({});
    setTitleModal({
      isOpen: true,
      mode: 'create',
      titleId: null,
      initialValues: emptyTitleFormValues(contentType),
    });
  };

  const openEditTitleModal = async (row: AdminTitleRow) => {
    clearNotices();
    setTitleFormErrors({});

    try {
      const title = selectedTitle?.id === row.id ? selectedTitle : await triggerGetTitle(row.id, true).unwrap();
      setSelectedTitleId(row.id);
      setTitleModal({
        isOpen: true,
        mode: 'edit',
        titleId: row.id,
        initialValues: mapTitleInfoToFormValues(title, row.releaseDate),
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleManageSeasons = (row: AdminTitleRow) => {
    void navigate(`/admin/series/${row.id}/seasons`);
  };

  const handleSubmitTitle = async (values: AdminTitleFormValues) => {
    const validationErrors = validateTitleForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setTitleFormErrors(validationErrors);
      return;
    }

    clearNotices();

    try {
      if (titleModal.mode === 'create') {
        const titleId = await addTitle(buildCreateTitleRequest(values)).unwrap();
        if (values.posterFile) {
          await uploadPoster({ titleId, poster: values.posterFile }).unwrap();
        }
        setSelectedTitleId(titleId);
        setSearchValue(values.name);
        setSubmittedSearchValue(values.name.trim());
        setSuccessMessage(`Created title "${values.name}".`);
      } else if (titleModal.titleId !== null) {
        await updateTitle({
          titleId: titleModal.titleId,
          body: buildUpdateTitleRequest(values),
        }).unwrap();
        if (values.posterFile) {
          await uploadPoster({ titleId: titleModal.titleId, poster: values.posterFile }).unwrap();
        }
        setSelectedTitleId(titleModal.titleId);
        setSuccessMessage(`Updated title "${values.name}".`);
      }

      setTitleModal(current => ({ ...current, isOpen: false }));
      await refreshCurrentData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteState) {
      return;
    }

    clearNotices();

    try {
      if (deleteState.targetType === 'title') {
        await softDeleteTitle(deleteState.id).unwrap();
        if (selectedTitleId === deleteState.id) {
          setSelectedTitleId(null);
        }
        setSuccessMessage(`Deleted title "${deleteState.name}".`);
      }

      setDeleteState(null);
      await refreshCurrentData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  if (!isAdmin) {
    console.log(role);
    return <UnauthorizedFallback />;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/70 p-4">
        <div>
          <h1 className="text-xl font-semibold text-text">Manage {pageTitle}</h1>
          <p className="text-sm text-muted">
            {contentType === 'movie' ? 'Create, edit, and remove movies.' : 'Manage TV series, seasons, and episodes.'}
          </p>
        </div>
        <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={openCreateTitleModal}>
          Create title
        </Button>
      </header>

      <TitlesToolbar
        searchValue={searchValue}
        selectedSort={selectedSort}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onSortChange={setSelectedSort}
        showTypeFilter={false}
      />

      {successMessage ? <InlineSuccessNotice message={successMessage} /> : null}
      {errorMessage ? <InlineErrorNotice message={errorMessage} /> : null}
      {selectedTitleError && !isNotFoundError(selectedTitleError) ? (
        <InlineErrorNotice message={getApiErrorMessage(selectedTitleError)} />
      ) : null}

      <section className="space-y-3">
        {titleRows.length > 0 ? (
          <TitlesTable
            rows={titleRows}
            activeTitleId={selectedTitleId}
            onEdit={openEditTitleModal}
            onDelete={row => setDeleteState({ targetType: 'title', id: row.id, name: row.name })}
            onManageSeasons={handleManageSeasons}
          />
        ) : null}
        {isLoadingTitles ? <LoadingState /> : null}
        {hasNoResults ? <EmptyState /> : null}
        {!isNotFoundError(activeSearchError) && activeSearchError && !isLoadingTitles ? (
          <InlineErrorNotice message={getApiErrorMessage(activeSearchError)} />
        ) : null}
      </section>

      <TitleFormModal
        isOpen={titleModal.isOpen}
        mode={titleModal.mode}
        initialValues={titleModal.initialValues}
        errors={titleFormErrors}
        isSubmitting={isSubmittingTitleForm}
        onClose={() => setTitleModal(current => ({ ...current, isOpen: false }))}
        onSubmit={handleSubmitTitle}
      />

      <ConfirmDeleteDialog
        isOpen={deleteState !== null}
        title={
          deleteState
            ? 'Delete title'
            : 'Delete item'
        }
        description={
          deleteState
            ? `Delete "${deleteState.name}" from the catalog. This action cannot be undone.`
            : 'This action cannot be undone.'
        }
        confirmLabel="Delete"
        isSubmitting={isSubmittingDelete}
        onCancel={() => setDeleteState(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
