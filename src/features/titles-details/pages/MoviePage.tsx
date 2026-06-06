import {useParams} from 'react-router-dom';
import {useAuth} from '../../auth/services/AuthProvider.tsx';
import {Badge} from '../../../components/common/Badge.tsx';
import {Card} from '../../../components/common/Card.tsx';
import {useGetTitleQuery} from '../../catalog/api/catalogApi.ts';
import {
  useDecrementMovieWatchCountMutation,
  useGetMovieWatchCountQuery,
  useIncrementMovieWatchCountMutation
} from '../../watch-tracking/api/watchTrackingApi.ts';
import {TitleType} from '../models/TitleType.ts';
import {WatchProgressButton} from '../../watch-tracking/components/WatchProgressButton.tsx';
import {
  formatGenericRating,
  formatRating,
  formatReleaseDate,
  formatRuntime,
  formatTextOrUnavailable,
  formatVoteCount,
  getContentType,
  getFullImageUrl,
  splitDisplayValues
} from '../../../utils/formatters.ts';
import CommentSection from '../../comments/components/CommentSection';
import {TitleWatchListPanel} from '../../watch-list/components/TitleWatchListPanel.tsx';
import {VoteControl} from '../../catalog/components/VoteControl.tsx';

export function MoviePage()
{
  const {titleId: titleIdParam} = useParams<{ titleId?: string }>();
  const contentId = Number(titleIdParam);
  const hasValidContentId = Number.isInteger(contentId) && contentId > 0;
  const {isAuthenticated, user} = useAuth();
  const userId = user?.id;

  const {data: titleInfo, isLoading, isError} = useGetTitleQuery(contentId, {skip: !hasValidContentId});
  const {
    data: movieWatchCount = 0,
    isFetching: isMovieWatchCountFetching,
    isError: isMovieWatchCountError
  } = useGetMovieWatchCountQuery(contentId, {skip: !isAuthenticated || !hasValidContentId});
  const [
    incrementMovieWatchCount,
    {isLoading: isIncrementingMovieWatchCount, isError: isIncrementMovieWatchCountError}
  ] = useIncrementMovieWatchCountMutation();
  const [
    decrementMovieWatchCount,
    {isLoading: isDecrementingMovieWatchCount, isError: isDecrementMovieWatchCountError}
  ] = useDecrementMovieWatchCountMutation();
  const handleMovieWatched = async () =>
  {
    try
    {
      await incrementMovieWatchCount(contentId).unwrap();
    } catch
    {
      // Mutation state drives the visible error message.
    }
  };

  const handleMovieUnwatched = async () =>
  {
    try
    {
      await decrementMovieWatchCount(contentId).unwrap();
    } catch
    {
      // Mutation state drives the visible error message.
    }
  };

  const castMembers = splitDisplayValues(titleInfo?.actors);
  const localizationLanguages = splitDisplayValues(titleInfo?.localizationLanguages);
  const genres = titleInfo?.genres ?? [];
  const spokenLanguages = titleInfo?.spokenLanguages ?? [];
  const productionCompanies = titleInfo?.productionCompanies ?? [];

  if (!hasValidContentId)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised"><h1 className="text-3xl font-semibold text-text">We could not load this movie.</h1></Card></main>;
  }

  if (isLoading)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised" className="animate-pulse h-72"/></main>;
  }

  if (isError || !titleInfo)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised"><h1 className="text-3xl font-semibold text-text">This movie is unavailable right now.</h1></Card></main>;
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card tone="glass" className="relative overflow-hidden">
          <div className="relative grid gap-6 lg:grid-cols-[500px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-background/45">
              {titleInfo.posterUrl ? (
                <img src={getFullImageUrl(titleInfo.posterUrl, 'w500')} alt={`${titleInfo.name} poster`} className="h-full w-full object-cover"/>
              ) : (
                <div className="flex h-full items-center justify-center bg-background/60 p-6 text-center text-sm text-muted">Poster unavailable</div>
              )}
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="accent">{getContentType(false, titleInfo.titleType)} details</Badge>
                {titleInfo.isAdult && <Badge tone="warning">Adult</Badge>}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">Catalog title</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text sm:text-5xl">{titleInfo.name}</h1>
                <p className="mt-3 text-base italic text-muted">{formatTextOrUnavailable(titleInfo.tagline)}</p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{formatTextOrUnavailable(titleInfo.overview)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Release date</div><div className="mt-2 text-lg font-semibold text-text">{formatReleaseDate(titleInfo.releaseDate)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Runtime</div><div className="mt-2 text-lg font-semibold text-text">{formatRuntime(titleInfo.runtime)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Average TMDB rating</div><div className="mt-2 text-lg font-semibold text-text">{formatRating(titleInfo.avgTmdbRating)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Average Watchly rating</div><div className="mt-2 text-lg font-semibold text-text">{`${formatGenericRating(titleInfo.avgVote)} (${formatVoteCount(titleInfo.voteCount)})`}</div></div>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Director</div><div className="mt-2 text-lg font-semibold text-text">{formatTextOrUnavailable(titleInfo.director)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Type</div><div className="mt-2 text-lg font-semibold text-text">{getContentType(false, titleInfo.titleType)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4 lg:col-span-2"><div className="text-xs uppercase tracking-[0.2em] text-muted">Actors</div><div className="mt-3 flex flex-wrap gap-2">{castMembers.map(actor => <span key={actor} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{actor}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Localization languages</div><div className="mt-3 flex flex-wrap gap-2">{localizationLanguages.map(language => <span key={language} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{language}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Spoken languages</div><div className="mt-3 flex flex-wrap gap-2">{spokenLanguages.map(language => <span key={language} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{language}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Genres</div><div className="mt-3 flex flex-wrap gap-2">{genres.map(genre => <span key={genre} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{genre}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Production companies</div><div className="mt-3 flex flex-wrap gap-2">{productionCompanies.map(company => <span key={company} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{company}</span>)}</div></div>
              </div>
              <VoteControl key={`title-${contentId}`} contentId={contentId} contentType="title" isAuthenticated={isAuthenticated}/>
              {isAuthenticated && userId ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
                  <div className="rounded-3xl border border-border/80 bg-background/30 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-accent">Watching progress</p>
                    <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                      <WatchProgressButton
                        watchCount={movieWatchCount}
                        itemLabel="movie"
                        onMarkWatched={handleMovieWatched}
                        onUnwatch={handleMovieUnwatched}
                        isLoading={isMovieWatchCountFetching || isIncrementingMovieWatchCount || isDecrementingMovieWatchCount}
                        isError={isMovieWatchCountError || isIncrementMovieWatchCountError || isDecrementMovieWatchCountError}
                        className="lg:min-w-[220px]"
                      />
                    </div>
                  </div>
                  <TitleWatchListPanel titleId={contentId} titleName={titleInfo.name} isAuthenticated={isAuthenticated}/>
                </div>
              ) : <TitleWatchListPanel titleId={contentId} titleName={titleInfo.name} isAuthenticated={isAuthenticated}/>}
            </div>
          </div>
        </Card>
        <CommentSection contentId={contentId} isEpisodeRoute={false} hasValidContentId={hasValidContentId} titleType={TitleType.Movie}/>
      </div>
    </main>
  );
}
