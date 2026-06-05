import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { catalogApi, useFilterTitlesQuery, useSearchTitlesQuery, useGetTitleQuery } from '../../catalog/api/catalogApi';
import { SortBy } from '../../catalog/models/types';
import type { TitleInfo, TitleShortInfo } from '../../titles-details/models/TitleInfo';
import { TitleType } from '../../titles-details/models/TitleType';
import { useAuth } from '../../auth/services/AuthProvider';
import { UserRole } from '../../auth/models/UserRole';
import {
  useAddEpisodeMutation,
  useAddSeasonMutation,
  useAddTitleMutation,
  useRemoveEpisodeMutation,
  useRemoveSeasonMutation,
  useSoftDeleteTitleMutation,
  useUpdateEpisodeMutation,
  useUpdateSeasonMutation,
  useUpdateTitleMutation,
  useUploadPosterMutation,
} from '../api/adminContentApi';
import { ContentBreadcrumbs } from '../components/ContentBreadcrumbs';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { EmptyState } from '../components/EmptyState';
import { EpisodeFormModal } from '../components/EpisodeFormModal';
import { InlineErrorNotice } from '../components/InlineErrorNotice';
import { InlineSuccessNotice } from '../components/InlineSuccessNotice';
import { LoadingState } from '../components/LoadingState';
import { SeasonFormModal } from '../components/SeasonFormModal';
import { SelectedTitleSummaryCard } from '../components/SelectedTitleSummaryCard';
import { SeriesStructurePanel } from '../components/SeriesStructurePanel';
import { TitleFormModal } from '../components/TitleFormModal';
import { TitlesTable } from '../components/TitlesTable';
import { TitlesToolbar } from '../components/TitlesToolbar';
import { UnauthorizedFallback } from '../components/UnauthorizedFallback';
import type {
  AdminEpisodeFormValues,
  AdminEditableTitleType,
  AdminEpisodeRow,
  AdminSeasonFormValues,
  AdminSeasonRow,
  AdminSortOption,
  AdminTitleFormValues,
  AdminTitleRow,
  AdminTitleTypeFilter,
  CreateEpisodeRequest,
  CreateSeasonRequest,
  CreateTitleRequest,
  UpdateEpisodeRequest,
  UpdateSeasonRequest,
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

type SeasonModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  seasonId: number | null;
  initialValues: AdminSeasonFormValues;
};

type EpisodeModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  episodeId: number | null;
  seasonId: number | null;
  initialValues: AdminEpisodeFormValues;
};

type DeleteState =
  | {
      targetType: 'title';
      id: number;
      name: string;
    }
  | {
      targetType: 'season';
      id: number;
      name: string;
    }
  | {
      targetType: 'episode';
      id: number;
      name: string;
    }
  | null;

const emptyTitleFormValues = (): AdminTitleFormValues => ({
  name: '',
  overview: '',
  titleType: 'movie',
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
});

const emptySeasonFormValues = (): AdminSeasonFormValues => ({
  ordinalNumber: '',
  name: '',
});

const emptyEpisodeFormValues = (tvShowId = ''): AdminEpisodeFormValues => ({
  ordinalNumber: '',
  runtime: '',
  tvShowId,
  name: '',
  posterUrl: '',
  releaseDate: '',
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

const parseInteger = (value: string) => Number.parseInt(value, 10);
const parseFloatValue = (value: string) => Number.parseFloat(value);

const mapTitleShortInfoToRow = (title: TitleShortInfo): AdminTitleRow => ({
  id: title.id,
  name: title.name,
  type: toEditableTitleType(title.titleType),
  releaseDate: formatDate(title.releaseDate),
  rating: title.avgTmdbRating ?? 0,
});

const mapTitleInfoToSeasons = (title: TitleInfo): AdminSeasonRow[] =>
  title.seasons
    .slice()
    .sort((left, right) => left.ordinalNumber - right.ordinalNumber)
    .map(season => ({
      id: season.seasonId,
      ordinalNumber: season.ordinalNumber,
      name: season.name,
      episodesCount: season.episodes.length,
      episodes: season.episodes.map(
          (episode, index) =>
            ({
              id: episode.episodeId,
              ordinalNumber: index + 1,
              name: episode.name,
              runtime: episode.runtime,
              releaseDate: undefined,
              overview: undefined,
            }) satisfies AdminEpisodeRow
        ),
    }));

const mapTitleInfoToFormValues = (title: TitleInfo): AdminTitleFormValues => ({
  name: title.name,
  overview: title.overview ?? '',
  titleType: toEditableTitleType(title.titleType),
  runtime: String(title.runtime),
  isAdult: title.isAdult,
  releaseDate: formatDate(title.releaseDate) === 'Unscheduled' ? '' : formatDate(title.releaseDate),
  posterUrl: title.posterUrl ?? '',
  posterFile: null,
  tagline: title.tagline ?? '',
  director: title.director ?? '',
  actors: title.actors ?? '',
  localizationLanguages: title.localizationLanguages ?? '',
  homePage: '',
  avgTmdbRating: title.avgTmdbRating == null ? '' : String(title.avgTmdbRating),
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

const validateSeasonForm = (values: AdminSeasonFormValues) => {
  const errors: ValidationErrors = {};
  const ordinalNumber = parseInteger(values.ordinalNumber);

  const nameError = validateRequired(values.name, 'Season name');
  if (nameError) {
    errors.name = nameError;
  }

  if (!values.ordinalNumber.trim() || !Number.isFinite(ordinalNumber) || ordinalNumber <= 0) {
    errors.ordinalNumber = 'Ordinal number must be greater than 0.';
  }

  return errors;
};

const validateEpisodeForm = (values: AdminEpisodeFormValues, mode: 'create' | 'edit') => {
  const errors: ValidationErrors = {};
  const ordinalNumber = parseInteger(values.ordinalNumber);
  const runtime = parseInteger(values.runtime);
  const tvShowId = parseInteger(values.tvShowId);

  const nameError = validateRequired(values.name, 'Episode name');
  if (nameError) {
    errors.name = nameError;
  }

  if (!values.ordinalNumber.trim() || !Number.isFinite(ordinalNumber) || ordinalNumber <= 0) {
    errors.ordinalNumber = 'Episode number must be greater than 0.';
  }

  if (!values.runtime.trim() || !Number.isFinite(runtime) || runtime < 0) {
    errors.runtime = 'Runtime must be a non-negative number.';
  }

  if (mode === 'create' && (!values.tvShowId.trim() || !Number.isFinite(tvShowId) || tvShowId <= 0)) {
    errors.tvShowId = 'TV show ID must be greater than 0.';
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
});

const buildSeasonRequest = (values: AdminSeasonFormValues): CreateSeasonRequest & UpdateSeasonRequest => ({
  ordinalNumber: parseInteger(values.ordinalNumber),
  name: values.name.trim(),
});

const buildCreateEpisodeRequest = (values: AdminEpisodeFormValues): CreateEpisodeRequest => ({
  ordinalNumber: parseInteger(values.ordinalNumber),
  runtime: parseInteger(values.runtime),
  tvShowId: parseInteger(values.tvShowId),
  name: values.name.trim(),
  posterUrl: values.posterUrl.trim(),
  releaseDate: values.releaseDate.trim() || null,
});

const buildUpdateEpisodeRequest = (values: AdminEpisodeFormValues): UpdateEpisodeRequest => ({
  ordinalNumber: parseInteger(values.ordinalNumber),
  runtime: parseInteger(values.runtime),
  name: values.name.trim(),
  posterUrl: values.posterUrl.trim() || null,
  releaseDate: values.releaseDate.trim() || null,
});

export function AdminContentPage() {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN;

  const [searchValue, setSearchValue] = useState('');
  const [submittedSearchValue, setSubmittedSearchValue] = useState('');
  const [selectedType, setSelectedType] = useState<AdminTitleTypeFilter>('all');
  const [selectedSort, setSelectedSort] = useState<AdminSortOption>('name');
  const [selectedTitleId, setSelectedTitleId] = useState<number | null>(null);
  const seriesStructureRef = useRef<HTMLDivElement>(null);
  const pendingManageSeasonsTitleIdRef = useRef<number | null>(null);

  const [titleModal, setTitleModal] = useState<TitleModalState>({
    isOpen: false,
    mode: 'create',
    titleId: null,
    initialValues: emptyTitleFormValues(),
  });
  const [titleFormErrors, setTitleFormErrors] = useState<ValidationErrors>({});

  const [seasonModal, setSeasonModal] = useState<SeasonModalState>({
    isOpen: false,
    mode: 'create',
    seasonId: null,
    initialValues: emptySeasonFormValues(),
  });
  const [seasonFormErrors, setSeasonFormErrors] = useState<ValidationErrors>({});

  const [episodeModal, setEpisodeModal] = useState<EpisodeModalState>({
    isOpen: false,
    mode: 'create',
    episodeId: null,
    seasonId: null,
    initialValues: emptyEpisodeFormValues(),
  });
  const [episodeFormErrors, setEpisodeFormErrors] = useState<ValidationErrors>({});

  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const hasSearch = submittedSearchValue.length > 0;

  const [triggerGetTitle] = catalogApi.useLazyGetTitleQuery();
  const [triggerGetEpisode] = catalogApi.useLazyGetEpisodeQuery();

  const {
    data: searchResults,
    error: searchError,
    isFetching: isFetchingSearch,
    refetch: refetchSearchResults,
  } = useSearchTitlesQuery({
    term: submittedSearchValue,
    page: 1,
    pageSize: 50,
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
  }, {
    skip: hasSearch,
  });

  const {
    data: selectedTitle,
    error: selectedTitleError,
    isFetching: isFetchingSelectedTitle,
    refetch: refetchSelectedTitle,
  } = useGetTitleQuery(selectedTitleId ?? 0, {
    skip: selectedTitleId === null,
  });

  const [addTitle, { isLoading: isAddingTitle }] = useAddTitleMutation();
  const [updateTitle, { isLoading: isUpdatingTitle }] = useUpdateTitleMutation();
  const [uploadPoster, { isLoading: isUploadingPoster }] = useUploadPosterMutation();
  const [softDeleteTitle, { isLoading: isDeletingTitle }] = useSoftDeleteTitleMutation();

  const [addSeason, { isLoading: isAddingSeason }] = useAddSeasonMutation();
  const [updateSeason, { isLoading: isUpdatingSeason }] = useUpdateSeasonMutation();
  const [removeSeason, { isLoading: isRemovingSeason }] = useRemoveSeasonMutation();

  const [addEpisode, { isLoading: isAddingEpisode }] = useAddEpisodeMutation();
  const [updateEpisode, { isLoading: isUpdatingEpisode }] = useUpdateEpisodeMutation();
  const [removeEpisode, { isLoading: isRemovingEpisode }] = useRemoveEpisodeMutation();

  const activeResults = hasSearch ? searchResults : filterResults;
  const activeSearchError = hasSearch ? searchError : filterError;
  const titleRowsSource = isNotFoundError(activeSearchError) ? [] : activeResults ?? [];

  useEffect(() => {
    if (selectedTitleId !== null && !titleRowsSource.some(title => title.id === selectedTitleId)) {
      setSelectedTitleId(null);
    }
  }, [selectedTitleId, titleRowsSource]);

  useEffect(() => {
    if (selectedTitleError && !isNotFoundError(selectedTitleError)) {
      setErrorMessage(getApiErrorMessage(selectedTitleError));
    }
  }, [selectedTitleError]);

  useEffect(() => {
    const pendingManageSeasonsTitleId = pendingManageSeasonsTitleIdRef.current;
    if (pendingManageSeasonsTitleId === null) {
      return;
    }

    if (!selectedTitle || selectedTitle.id !== pendingManageSeasonsTitleId) {
      return;
    }

    if (toEditableTitleType(selectedTitle.titleType) !== 'series') {
      pendingManageSeasonsTitleIdRef.current = null;
      return;
    }

    seriesStructureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pendingManageSeasonsTitleIdRef.current = null;
  }, [selectedTitle]);

  const filteredRows = titleRowsSource
    .map(mapTitleShortInfoToRow)
    .filter(row => selectedType === 'all' || row.type === selectedType);
  const titleRows = sortRows(filteredRows, selectedSort);
  const selectedSeasonRows = selectedTitle ? mapTitleInfoToSeasons(selectedTitle) : [];

  const isLoadingTitles = hasSearch ? isFetchingSearch : isFetchingFilter;
  const hasNoResults = !isLoadingTitles && titleRows.length === 0;
  const isSubmittingTitleForm = isAddingTitle || isUpdatingTitle || isUploadingPoster;
  const isSubmittingSeasonForm = isAddingSeason || isUpdatingSeason;
  const isSubmittingEpisodeForm = isAddingEpisode || isUpdatingEpisode;
  const isSubmittingDelete = isDeletingTitle || isRemovingSeason || isRemovingEpisode;

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
      initialValues: emptyTitleFormValues(),
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
        initialValues: mapTitleInfoToFormValues(title),
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const openCreateSeasonModal = () => {
    if (!selectedTitle || toEditableTitleType(selectedTitle.titleType) !== 'series') {
      return;
    }

    clearNotices();
    setSeasonFormErrors({});
    setSeasonModal({
      isOpen: true,
      mode: 'create',
      seasonId: null,
      initialValues: emptySeasonFormValues(),
    });
  };

  const openEditSeasonModal = (season: AdminSeasonRow) => {
    clearNotices();
    setSeasonFormErrors({});
    setSeasonModal({
      isOpen: true,
      mode: 'edit',
      seasonId: season.id,
      initialValues: {
        ordinalNumber: String(season.ordinalNumber),
        name: season.name,
      },
    });
  };

  const openCreateEpisodeModal = (season: AdminSeasonRow) => {
    if (!selectedTitle) {
      return;
    }

    clearNotices();
    setEpisodeFormErrors({});
    setEpisodeModal({
      isOpen: true,
      mode: 'create',
      episodeId: null,
      seasonId: season.id,
      initialValues: emptyEpisodeFormValues(String(selectedTitle.id)),
    });
  };

  const openEditEpisodeModal = async (season: AdminSeasonRow, episodeId: number) => {
    clearNotices();
    setEpisodeFormErrors({});

    try {
      const episode = await triggerGetEpisode(episodeId, true).unwrap();
      setEpisodeModal({
        isOpen: true,
        mode: 'edit',
        episodeId,
        seasonId: season.id,
        initialValues: {
          ordinalNumber: String(episode.ordinalNumber),
          runtime: String(episode.runtime),
          tvShowId: selectedTitle ? String(selectedTitle.id) : '',
          name: episode.name,
          posterUrl: episode.posterUrl ?? '',
          releaseDate: '',
        },
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleManageSeasons = (row: AdminTitleRow) => {
    pendingManageSeasonsTitleIdRef.current = row.id;
    setSelectedTitleId(row.id);
    clearNotices();
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

  const handleSubmitSeason = async (values: AdminSeasonFormValues) => {
    const validationErrors = validateSeasonForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setSeasonFormErrors(validationErrors);
      return;
    }

    clearNotices();

    try {
      if (seasonModal.mode === 'create') {
        if (selectedTitleId === null) {
          return;
        }

        await addSeason({
          titleId: selectedTitleId,
          body: buildSeasonRequest(values),
        }).unwrap();
        setSuccessMessage(`Created season "${values.name}".`);
      } else if (seasonModal.seasonId !== null) {
        await updateSeason({
          seasonId: seasonModal.seasonId,
          body: buildSeasonRequest(values),
        }).unwrap();
        setSuccessMessage(`Updated season "${values.name}".`);
      }

      setSeasonModal(current => ({ ...current, isOpen: false }));
      await refreshCurrentData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleSubmitEpisode = async (values: AdminEpisodeFormValues) => {
    const validationErrors = validateEpisodeForm(values, episodeModal.mode);
    if (Object.keys(validationErrors).length > 0) {
      setEpisodeFormErrors(validationErrors);
      return;
    }

    clearNotices();

    try {
      if (episodeModal.mode === 'create') {
        if (episodeModal.seasonId === null) {
          return;
        }

        await addEpisode({
          seasonId: episodeModal.seasonId,
          body: buildCreateEpisodeRequest(values),
        }).unwrap();
        setSuccessMessage(`Created episode "${values.name}".`);
      } else if (episodeModal.episodeId !== null) {
        await updateEpisode({
          episodeId: episodeModal.episodeId,
          body: buildUpdateEpisodeRequest(values),
        }).unwrap();
        setSuccessMessage(`Updated episode "${values.name}".`);
      }

      setEpisodeModal(current => ({ ...current, isOpen: false }));
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

      if (deleteState.targetType === 'season') {
        await removeSeason(deleteState.id).unwrap();
        setSuccessMessage(`Deleted season "${deleteState.name}".`);
      }

      if (deleteState.targetType === 'episode') {
        await removeEpisode(deleteState.id).unwrap();
        setSuccessMessage(`Deleted episode "${deleteState.name}".`);
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
          <h1 className="text-xl font-semibold text-text">Admin Content</h1>
          <p className="text-sm text-muted">Manage movies, TV shows, seasons, and episodes.</p>
        </div>
        <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={openCreateTitleModal}>
          Create title
        </Button>
      </header>

      <TitlesToolbar
        searchValue={searchValue}
        selectedType={selectedType}
        selectedSort={selectedSort}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onTypeChange={setSelectedType}
        onSortChange={setSelectedSort}
      />

      {successMessage ? <InlineSuccessNotice message={successMessage} /> : null}
      {errorMessage ? <InlineErrorNotice message={errorMessage} /> : null}

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

      {selectedTitle ? (
        <div ref={seriesStructureRef} className="space-y-5">
          <ContentBreadcrumbs
            titleName={selectedTitle.name}
            showSeasonsTrail={toEditableTitleType(selectedTitle.titleType) === 'series'}
          />
          <SelectedTitleSummaryCard
            name={selectedTitle.name}
            type={toEditableTitleType(selectedTitle.titleType)}
            onBack={() => setSelectedTitleId(null)}
          />
          {toEditableTitleType(selectedTitle.titleType) === 'series' ? (
            <SeriesStructurePanel
              titleName={selectedTitle.name}
              seasons={selectedSeasonRows}
              onAddSeason={openCreateSeasonModal}
              onAddEpisode={openCreateEpisodeModal}
              onEditSeason={openEditSeasonModal}
              onDeleteSeason={season => setDeleteState({ targetType: 'season', id: season.id, name: season.name })}
              onEditEpisode={openEditEpisodeModal}
              onDeleteEpisode={(season, episodeId) => {
                const episode = season.episodes.find(item => item.id === episodeId);
                setDeleteState({
                  targetType: 'episode',
                  id: episodeId,
                  name: episode?.name ?? `Episode ${episodeId}`,
                });
              }}
            />
          ) : null}
        </div>
      ) : null}

      {selectedTitleId !== null && isFetchingSelectedTitle && !selectedTitle ? <LoadingState /> : null}

      <TitleFormModal
        isOpen={titleModal.isOpen}
        mode={titleModal.mode}
        initialValues={titleModal.initialValues}
        errors={titleFormErrors}
        isSubmitting={isSubmittingTitleForm}
        onClose={() => setTitleModal(current => ({ ...current, isOpen: false }))}
        onSubmit={handleSubmitTitle}
      />

      <SeasonFormModal
        isOpen={seasonModal.isOpen}
        mode={seasonModal.mode}
        initialValues={seasonModal.initialValues}
        errors={seasonFormErrors}
        isSubmitting={isSubmittingSeasonForm}
        onClose={() => setSeasonModal(current => ({ ...current, isOpen: false }))}
        onSubmit={handleSubmitSeason}
      />

      <EpisodeFormModal
        isOpen={episodeModal.isOpen}
        mode={episodeModal.mode}
        initialValues={episodeModal.initialValues}
        errors={episodeFormErrors}
        isSubmitting={isSubmittingEpisodeForm}
        onClose={() => setEpisodeModal(current => ({ ...current, isOpen: false }))}
        onSubmit={handleSubmitEpisode}
      />

      <ConfirmDeleteDialog
        isOpen={deleteState !== null}
        title={
          deleteState
            ? `Delete ${deleteState.targetType === 'title' ? 'title' : deleteState.targetType === 'season' ? 'season' : 'episode'}`
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
