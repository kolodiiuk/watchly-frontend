import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../auth/services/AuthProvider';
import { UserRole } from '../../auth/models/UserRole';
import { catalogApi, useGetTitleQuery } from '../../catalog/api/catalogApi';
import { TitleType } from '../../titles-details/models/TitleType';
import type { TitleInfo } from '../../titles-details/models/TitleInfo';
import {
  useAddEpisodeMutation,
  useAddSeasonMutation,
  useRemoveEpisodeMutation,
  useRemoveSeasonMutation,
  useUpdateEpisodeMutation,
  useUpdateSeasonMutation,
} from '../api/adminContentApi';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { ContentBreadcrumbs } from '../components/ContentBreadcrumbs';
import { EpisodeFormModal } from '../components/EpisodeFormModal';
import { InlineErrorNotice } from '../components/InlineErrorNotice';
import { InlineSuccessNotice } from '../components/InlineSuccessNotice';
import { LoadingState } from '../components/LoadingState';
import { SeasonFormModal } from '../components/SeasonFormModal';
import { SeriesStructurePanel } from '../components/SeriesStructurePanel';
import { UnauthorizedFallback } from '../components/UnauthorizedFallback';
import type {
  AdminEpisodeFormValues,
  AdminEpisodeRow,
  AdminSeasonFormValues,
  AdminSeasonRow,
  CreateEpisodeRequest,
  CreateSeasonRequest,
  UpdateEpisodeRequest,
  UpdateSeasonRequest,
} from '../models/types';
import { validateRequired } from '../services/validation';
import type { ValidationErrors } from '../services/validation';

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
  | { targetType: 'season'; id: number; name: string }
  | { targetType: 'episode'; id: number; name: string }
  | null;

const emptySeasonFormValues = (): AdminSeasonFormValues => ({ ordinalNumber: '', name: '' });

const emptyEpisodeFormValues = (tvShowId: string): AdminEpisodeFormValues => ({
  ordinalNumber: '',
  runtime: '',
  tvShowId,
  name: '',
  posterUrl: '',
  releaseDate: '',
});

const parseInteger = (value: string) => Number.parseInt(value, 10);

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

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    if ('data' in error) {
      const data = (error as { data?: { detail?: string; title?: string } }).data;
      if (data?.detail) return data.detail;
      if (data?.title) return data.title;
    }

    if ('error' in error && typeof (error as { error?: string }).error === 'string') {
      return (error as { error: string }).error;
    }
  }

  return 'An unexpected error occurred.';
};

const validateSeasonForm = (values: AdminSeasonFormValues) => {
  const errors: ValidationErrors = {};
  const ordinalNumber = parseInteger(values.ordinalNumber);
  const nameError = validateRequired(values.name, 'Season name');

  if (nameError) errors.name = nameError;
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

  if (nameError) errors.name = nameError;
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

export function AdminSeriesSeasonsPage() {
  const navigate = useNavigate();
  const { titleId: titleIdParam } = useParams();
  const { role } = useAuth();
  const titleId = Number.parseInt(titleIdParam ?? '', 10);
  const hasValidTitleId = Number.isFinite(titleId) && titleId > 0;

  const { data: title, error: titleError, isFetching, refetch } = useGetTitleQuery(titleId, {
    skip: !hasValidTitleId,
  });
  const [triggerGetEpisode] = catalogApi.useLazyGetEpisodeQuery();
  const [addSeason, { isLoading: isAddingSeason }] = useAddSeasonMutation();
  const [updateSeason, { isLoading: isUpdatingSeason }] = useUpdateSeasonMutation();
  const [removeSeason, { isLoading: isRemovingSeason }] = useRemoveSeasonMutation();
  const [addEpisode, { isLoading: isAddingEpisode }] = useAddEpisodeMutation();
  const [updateEpisode, { isLoading: isUpdatingEpisode }] = useUpdateEpisodeMutation();
  const [removeEpisode, { isLoading: isRemovingEpisode }] = useRemoveEpisodeMutation();

  const [seasonModal, setSeasonModal] = useState<SeasonModalState>({
    isOpen: false,
    mode: 'create',
    seasonId: null,
    initialValues: emptySeasonFormValues(),
  });
  const [episodeModal, setEpisodeModal] = useState<EpisodeModalState>({
    isOpen: false,
    mode: 'create',
    episodeId: null,
    seasonId: null,
    initialValues: emptyEpisodeFormValues(String(titleId)),
  });
  const [seasonFormErrors, setSeasonFormErrors] = useState<ValidationErrors>({});
  const [episodeFormErrors, setEpisodeFormErrors] = useState<ValidationErrors>({});
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const clearNotices = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const openCreateSeasonModal = () => {
    clearNotices();
    setSeasonFormErrors({});
    setSeasonModal({ isOpen: true, mode: 'create', seasonId: null, initialValues: emptySeasonFormValues() });
  };

  const openEditSeasonModal = (season: AdminSeasonRow) => {
    clearNotices();
    setSeasonFormErrors({});
    setSeasonModal({
      isOpen: true,
      mode: 'edit',
      seasonId: season.id,
      initialValues: { ordinalNumber: String(season.ordinalNumber), name: season.name },
    });
  };

  const openCreateEpisodeModal = (season: AdminSeasonRow) => {
    clearNotices();
    setEpisodeFormErrors({});
    setEpisodeModal({
      isOpen: true,
      mode: 'create',
      episodeId: null,
      seasonId: season.id,
      initialValues: emptyEpisodeFormValues(String(titleId)),
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
          tvShowId: String(titleId),
          name: episode.name,
          posterUrl: episode.posterUrl ?? '',
          releaseDate: '',
        },
      });
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
        await addSeason({ titleId, body: buildSeasonRequest(values) }).unwrap();
        setSuccessMessage(`Created season "${values.name}".`);
      } else if (seasonModal.seasonId !== null) {
        await updateSeason({ seasonId: seasonModal.seasonId, body: buildSeasonRequest(values) }).unwrap();
        setSuccessMessage(`Updated season "${values.name}".`);
      }

      setSeasonModal(current => ({ ...current, isOpen: false }));
      await refetch();
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
      if (episodeModal.mode === 'create' && episodeModal.seasonId !== null) {
        await addEpisode({ seasonId: episodeModal.seasonId, body: buildCreateEpisodeRequest(values) }).unwrap();
        setSuccessMessage(`Created episode "${values.name}".`);
      } else if (episodeModal.mode === 'edit' && episodeModal.episodeId !== null) {
        await updateEpisode({ episodeId: episodeModal.episodeId, body: buildUpdateEpisodeRequest(values) }).unwrap();
        setSuccessMessage(`Updated episode "${values.name}".`);
      }

      setEpisodeModal(current => ({ ...current, isOpen: false }));
      await refetch();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteState) return;

    clearNotices();
    try {
      if (deleteState.targetType === 'season') {
        await removeSeason(deleteState.id).unwrap();
        setSuccessMessage(`Deleted season "${deleteState.name}".`);
      } else {
        await removeEpisode(deleteState.id).unwrap();
        setSuccessMessage(`Deleted episode "${deleteState.name}".`);
      }

      setDeleteState(null);
      await refetch();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  if (role !== UserRole.ADMIN) return <UnauthorizedFallback />;

  if (!hasValidTitleId) return <InlineErrorNotice message="Invalid TV series ID." />;

  if (isFetching && !title) return <LoadingState />;

  if (titleError || !title) {
    return <InlineErrorNotice message={titleError ? getApiErrorMessage(titleError) : 'TV series not found.'} />;
  }

  if (title.titleType !== TitleType.Series) {
    return <InlineErrorNotice message="Selected title is not a TV series." />;
  }

  const seasons = mapTitleInfoToSeasons(title);
  const isSubmittingSeason = isAddingSeason || isUpdatingSeason;
  const isSubmittingEpisode = isAddingEpisode || isUpdatingEpisode;
  const isSubmittingDelete = isRemovingSeason || isRemovingEpisode;

  return (
    <div className="space-y-5">
      <ContentBreadcrumbs titleName={title.name} showSeasonsTrail />

      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/70 p-4">
        <div>
          <h1 className="text-xl font-semibold text-text">Manage Seasons</h1>
          <p className="text-sm text-muted">{title.name}</p>
        </div>
        <Button variant="secondary" leadingIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => void navigate('/admin/series')}>
          Back to TV series
        </Button>
      </header>

      {successMessage ? <InlineSuccessNotice message={successMessage} /> : null}
      {errorMessage ? <InlineErrorNotice message={errorMessage} /> : null}

      <SeriesStructurePanel
        titleName={title.name}
        seasons={seasons}
        onAddSeason={openCreateSeasonModal}
        onAddEpisode={openCreateEpisodeModal}
        onEditSeason={openEditSeasonModal}
        onDeleteSeason={season => setDeleteState({ targetType: 'season', id: season.id, name: season.name })}
        onEditEpisode={openEditEpisodeModal}
        onDeleteEpisode={(season, episodeId) => {
          const episode = season.episodes.find(item => item.id === episodeId);
          setDeleteState({ targetType: 'episode', id: episodeId, name: episode?.name ?? `Episode ${episodeId}` });
        }}
      />

      <SeasonFormModal
        isOpen={seasonModal.isOpen}
        mode={seasonModal.mode}
        initialValues={seasonModal.initialValues}
        errors={seasonFormErrors}
        isSubmitting={isSubmittingSeason}
        onClose={() => setSeasonModal(current => ({ ...current, isOpen: false }))}
        onSubmit={handleSubmitSeason}
      />

      <EpisodeFormModal
        isOpen={episodeModal.isOpen}
        mode={episodeModal.mode}
        initialValues={episodeModal.initialValues}
        errors={episodeFormErrors}
        isSubmitting={isSubmittingEpisode}
        onClose={() => setEpisodeModal(current => ({ ...current, isOpen: false }))}
        onSubmit={handleSubmitEpisode}
      />

      <ConfirmDeleteDialog
        isOpen={deleteState !== null}
        title={deleteState ? `Delete ${deleteState.targetType}` : 'Delete item'}
        description={deleteState ? `Delete "${deleteState.name}" from the catalog. This action cannot be undone.` : ''}
        confirmLabel="Delete"
        isSubmitting={isSubmittingDelete}
        onCancel={() => setDeleteState(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
