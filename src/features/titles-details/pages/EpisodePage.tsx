import {type ChangeEvent, useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useAuth} from '../../auth/services/AuthProvider.tsx';
import {Badge} from '../../../components/common/Badge.tsx';
import {Button} from '../../../components/common/Button.tsx';
import {Card} from '../../../components/common/Card.tsx';
import {useGetEpisodeQuery} from '../../catalog/api/catalogApi.ts';
import {useVoteEpisodeMutation} from '../../catalog/api/voteApi.ts';
import {
  useDecrementEpisodeWatchCountMutation,
  useGetEpisodeWatchCountQuery,
  useIncrementEpisodeWatchCountMutation
} from '../../watch-tracking/api/watchTrackingApi.ts';
import {TitleType} from '../models/TitleType.ts';
import {formatGenericRating, formatVoteCount, getFullImageUrl} from '../../../utils/formatters.ts';
import CommentSection from '../../comments/components/CommentSection';
import {WatchProgressButton} from '../../watch-tracking/components/WatchProgressButton.tsx';

function TitleLink({titleId, titleName, hash}: { titleId: number; titleName: string; hash?: string })
{
  return <Link to={`/series/${titleId}${hash || ''}`} className="text-accent transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30">{titleName}</Link>;
}

export function EpisodePage()
{
  const {episodeId: episodeIdParam} = useParams<{ episodeId?: string }>();
  const contentId = Number(episodeIdParam);
  const hasValidContentId = Number.isInteger(contentId) && contentId > 0;
  const {isAuthenticated, user} = useAuth();
  const userId = user?.id;
  const [selectedVoteValue, setSelectedVoteValue] = useState(8);
  const [hasSubmittedVote, setHasSubmittedVote] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const {data: episodeInfo, isLoading, isError} = useGetEpisodeQuery(contentId, {skip: !hasValidContentId});
  const [voteEpisode, {isLoading: isSubmittingVote}] = useVoteEpisodeMutation();
  const {
    data: episodeWatchCount = 0,
    isFetching: isEpisodeWatchCountFetching,
    isError: isEpisodeWatchCountError
  } = useGetEpisodeWatchCountQuery(contentId, {skip: !isAuthenticated || !hasValidContentId});
  const [
    incrementEpisodeWatchCount,
    {isLoading: isIncrementingEpisodeWatchCount, isError: isIncrementEpisodeWatchCountError}
  ] = useIncrementEpisodeWatchCountMutation();
  const [
    decrementEpisodeWatchCount,
    {isLoading: isDecrementingEpisodeWatchCount, isError: isDecrementEpisodeWatchCountError}
  ] = useDecrementEpisodeWatchCountMutation();

  useEffect(() =>
  {
    setHasSubmittedVote(false);
    setVoteError(null);
    setVoteMessage(null);
  }, [contentId]);

  const onVoteValueSelect = (event: ChangeEvent<HTMLSelectElement>) =>
  {
    setSelectedVoteValue(Number(event.target.value));
    setVoteError(null);
    setVoteMessage(null);
  };

  const handleVoteSubmit = async () =>
  {
    setVoteError(null);
    setVoteMessage(null);
    if (!isAuthenticated)
    {
      setVoteError('Please sign in to rate this episode.');
      return;
    }
    if (hasSubmittedVote)
    {
      setVoteError('Changing an existing vote needs vote lookup support from the current API.');
      return;
    }
    try
    {
      await voteEpisode({episodeId: contentId, value: selectedVoteValue}).unwrap();
      setHasSubmittedVote(true);
      setVoteMessage(`Your rating of ${selectedVoteValue}/10 has been submitted.`);
    } catch
    {
      setVoteError('We could not submit your vote right now.');
    }
  };

  const handleEpisodeWatched = async () =>
  {
    try
    {
      await incrementEpisodeWatchCount(contentId).unwrap();
    } catch
    {
      // Mutation state drives the visible error message.
    }
  };

  const handleEpisodeUnwatched = async () =>
  {
    try
    {
      await decrementEpisodeWatchCount(contentId).unwrap();
    } catch
    {
      // Mutation state drives the visible error message.
    }
  };

  if (!hasValidContentId)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised"><h1 className="text-3xl font-semibold text-text">We could not load this episode.</h1></Card></main>;
  }
  if (isLoading)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised" className="animate-pulse h-72"/></main>;
  }
  if (isError || !episodeInfo)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised"><h1 className="text-3xl font-semibold text-text">This episode is unavailable right now.</h1></Card></main>;
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card tone="glass" className="relative overflow-hidden">
          <div className="relative grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-background/45">
              {episodeInfo.posterUrl ? <img src={getFullImageUrl(episodeInfo.posterUrl, 'w500')} alt={`${episodeInfo.name?.trim() || `Episode ${episodeInfo.ordinalNumber}`} poster`} className="aspect-[0.72/1] h-full w-full object-cover"/> : <div className="flex aspect-[0.72/1] items-center justify-center bg-background/60 p-6 text-center text-sm text-muted">Episode poster unavailable</div>}
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3"><Badge tone="accent">Episode details</Badge><Badge tone="default">Season {episodeInfo.season.ordinalNumber}</Badge></div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">Catalog episode</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text sm:text-5xl">{episodeInfo.name?.trim() || `Episode ${episodeInfo.ordinalNumber}`}</h1>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Title</div><div className="mt-2 text-lg font-semibold"><TitleLink titleId={episodeInfo.season.titleId} titleName={episodeInfo.season.titleName}/></div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Season</div><div className="mt-2 text-lg font-semibold"><TitleLink titleId={episodeInfo.season.titleId} titleName={episodeInfo.season.name?.trim() || `Season ${episodeInfo.season.ordinalNumber}`} hash="#seasons"/></div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Episode</div><div className="mt-2 text-lg font-semibold text-text">{episodeInfo.name?.trim() || `Episode ${episodeInfo.ordinalNumber}`}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Average Watchly rating</div><div className="mt-2 text-lg font-semibold text-text">{`${formatGenericRating(episodeInfo.avgVote)} (${formatVoteCount(episodeInfo.voteCount)})`}</div></div>
              </div>
              <div className="rounded-3xl border border-border/80 bg-background/30 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-accent">Status and actions</p>
                <div className="grid gap-3 mt-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <label className="block"><span className="text-xs uppercase tracking-[0.2em] text-muted">Your Watchly rating</span><select value={selectedVoteValue} onChange={onVoteValueSelect} disabled={!isAuthenticated || isSubmittingVote} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text disabled:opacity-70">{Array.from({length: 10}, (_, index) => index + 1).map(value => <option key={value} value={value}>{value} / 10</option>)}</select></label>
                  <Button type="button" onClick={handleVoteSubmit} disabled={isSubmittingVote || !isAuthenticated} className="lg:min-w-[150px]">{hasSubmittedVote ? 'Change vote' : 'Submit vote'}</Button>
                </div>
                {voteError ? <p className="mt-2 text-sm text-danger">{voteError}</p> : null}
                {voteMessage ? <p className="mt-2 text-sm text-success">{voteMessage}</p> : null}
                {isAuthenticated && userId ? (
                  <div className="mt-3">
                    <WatchProgressButton
                      watchCount={episodeWatchCount}
                      itemLabel="episode"
                      onMarkWatched={handleEpisodeWatched}
                      onUnwatch={handleEpisodeUnwatched}
                      isLoading={isEpisodeWatchCountFetching || isIncrementingEpisodeWatchCount || isDecrementingEpisodeWatchCount}
                      isError={isEpisodeWatchCountError || isIncrementEpisodeWatchCountError || isDecrementEpisodeWatchCountError}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
        <CommentSection contentId={contentId} isEpisodeRoute titleType={TitleType.Series} hasValidContentId={hasValidContentId}/>
      </div>
    </main>
  );
}
