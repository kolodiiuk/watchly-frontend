import {type ChangeEvent, type ReactNode, useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useAuth} from '../../features/auth/services/AuthProvider.tsx';
import {Badge} from '../../components/ui/Badge.tsx';
import {Button} from '../../components/ui/Button.tsx';
import {Card} from '../../components/ui/Card.tsx';
import {useGetTitleQuery} from '../api/catalogApi.ts';
import {useVoteTitleMutation} from '../api/voteApi.ts';
import {TitleType} from '../models/TitleType.tsx';
import {WatchStatus} from '../models/WatchStatus.ts';
import {formatGenericRating, formatRating, formatReleaseDate, formatRuntime, formatTextOrUnavailable, formatVoteCount, getFullImageUrl, splitDisplayValues} from '../../utils/formatters.ts';
import CommentSection from './CommentSection';

const watchStatusOptions = [
  {value: WatchStatus.PlanToWatch, label: 'Plan to watch'},
  {value: WatchStatus.Watching, label: 'Watching'},
  {value: WatchStatus.Completed, label: 'Completed'},
  {value: WatchStatus.Dropped, label: 'Dropped'},
];

function EpisodeLink({episodeId, children, className = ''}: { episodeId: number; children: ReactNode; className?: string })
{
  return <Link to={`/episode/${episodeId}`} className={['transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30', className].filter(Boolean).join(' ')}>{children}</Link>;
}

export function SeriesPage()
{
  const {titleId: titleIdParam} = useParams<{ titleId?: string }>();
  const contentId = Number(titleIdParam);
  const hasValidContentId = Number.isInteger(contentId) && contentId > 0;
  const {isAuthenticated} = useAuth();
  const seasonsRef = useRef<HTMLDivElement>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
  const [selectedWatchStatus, setSelectedWatchStatus] = useState<WatchStatus>(WatchStatus.PlanToWatch);
  const [selectedVoteValue, setSelectedVoteValue] = useState(8);
  const [hasSubmittedVote, setHasSubmittedVote] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);

  const {data: titleInfo, isLoading, isError} = useGetTitleQuery(contentId, {skip: !hasValidContentId});
  const [voteTitle, {isLoading: isSubmittingVote}] = useVoteTitleMutation();

  useEffect(() =>
  {
    setHasSubmittedVote(false);
    setVoteError(null);
    setVoteMessage(null);
  }, [contentId]);

  useEffect(() =>
  {
    const hash = window.location.hash;
    if (hash === '#seasons' && seasonsRef.current)
    {
      setTimeout(() => seasonsRef.current?.scrollIntoView({behavior: 'smooth'}), 0);
    }
  }, [titleInfo]);

  const handleWatchStatusChange = (_titleId: number, _status: WatchStatus) =>
  {
  };

  const onWatchStatusSelect = (event: ChangeEvent<HTMLSelectElement>) =>
  {
    const nextStatus = Number(event.target.value) as WatchStatus;
    setSelectedWatchStatus(nextStatus);
    handleWatchStatusChange(contentId, nextStatus);
  };

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
      setVoteError('Please sign in to rate this title.');
      return;
    }

    if (hasSubmittedVote)
    {
      setVoteError('Changing an existing vote needs vote lookup support from the current API.');
      return;
    }

    try
    {
      await voteTitle({titleId: contentId, value: selectedVoteValue}).unwrap();
      setHasSubmittedVote(true);
      setVoteMessage(`Your rating of ${selectedVoteValue}/10 has been submitted.`);
    } catch
    {
      setVoteError('We could not submit your vote right now.');
    }
  };

  const castMembers = splitDisplayValues(titleInfo?.actors);
  const localizationLanguages = splitDisplayValues(titleInfo?.localizationLanguages);
  const genres = titleInfo?.genres ?? [];
  const spokenLanguages = titleInfo?.spokenLanguages ?? [];
  const productionCompanies = titleInfo?.productionCompanies ?? [];

  if (!hasValidContentId)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised"><h1 className="text-3xl font-semibold text-text">We could not load this series.</h1></Card></main>;
  }
  if (isLoading)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised" className="animate-pulse h-72"/></main>;
  }
  if (isError || !titleInfo)
  {
    return <main className="px-4 py-6 sm:px-6 lg:px-10"><Card tone="raised"><h1 className="text-3xl font-semibold text-text">This series is unavailable right now.</h1></Card></main>;
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card tone="glass" className="relative overflow-hidden">
          <div className="relative grid gap-6 lg:grid-cols-[500px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-background/45">
              {titleInfo.posterUrl ? <img src={getFullImageUrl(titleInfo.posterUrl, 'w500')} alt={`${titleInfo.name} poster`} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center bg-background/60 p-6 text-center text-sm text-muted">Poster unavailable</div>}
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3"><Badge tone="accent">Series details</Badge>{titleInfo.isAdult && <Badge tone="warning">Adult</Badge>}</div>
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
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Type</div><div className="mt-2 text-lg font-semibold text-text">Series</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4 lg:col-span-2"><div className="text-xs uppercase tracking-[0.2em] text-muted">Actors</div><div className="mt-3 flex flex-wrap gap-2">{castMembers.map(actor => <span key={actor} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{actor}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Localization languages</div><div className="mt-3 flex flex-wrap gap-2">{localizationLanguages.map(language => <span key={language} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{language}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Spoken languages</div><div className="mt-3 flex flex-wrap gap-2">{spokenLanguages.map(language => <span key={language} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{language}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Genres</div><div className="mt-3 flex flex-wrap gap-2">{genres.map(genre => <span key={genre} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{genre}</span>)}</div></div>
                <div className="rounded-2xl border border-border/80 bg-background/35 p-4"><div className="text-xs uppercase tracking-[0.2em] text-muted">Production companies</div><div className="mt-3 flex flex-wrap gap-2">{productionCompanies.map(company => <span key={company} className="rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-sm text-text">{company}</span>)}</div></div>
              </div>
              <div className="rounded-3xl border border-border/80 bg-background/30 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-accent">Status and actions</p>
                <label className="block mt-3"><span className="text-xs uppercase tracking-[0.2em] text-muted">Watch status</span><select value={selectedWatchStatus} onChange={onWatchStatusSelect} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text">{watchStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <div className="grid gap-3 mt-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <label className="block"><span className="text-xs uppercase tracking-[0.2em] text-muted">Your Watchly rating</span><select value={selectedVoteValue} onChange={onVoteValueSelect} disabled={!isAuthenticated || isSubmittingVote} className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text disabled:opacity-70">{Array.from({length: 10}, (_, index) => index + 1).map(value => <option key={value} value={value}>{value} / 10</option>)}</select></label>
                  <Button type="button" onClick={handleVoteSubmit} disabled={isSubmittingVote || !isAuthenticated} className="lg:min-w-[150px]">{hasSubmittedVote ? 'Change vote' : 'Submit vote'}</Button>
                </div>
                {voteError ? <p className="mt-2 text-sm text-danger">{voteError}</p> : null}
                {voteMessage ? <p className="mt-2 text-sm text-success">{voteMessage}</p> : null}
              </div>
            </div>
          </div>
        </Card>
        {titleInfo.seasons.length ? (
          <div ref={seasonsRef}>
            <Card tone="glass" className="relative overflow-hidden">
              <div className="relative space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div><p className="text-sm uppercase tracking-[0.24em] text-muted">Seasons and episodes</p><h2 className="mt-2 text-2xl font-semibold text-text">Browse the series run</h2></div>
                  <Badge tone="default">{titleInfo.seasons.length} season{titleInfo.seasons.length === 1 ? '' : 's'}</Badge>
                </div>
                <div className="space-y-4">
                  {titleInfo.seasons.map(season =>
                  {
                    const isExpanded = expandedSeasons.has(season.seasonId);
                    const toggleSeason = () =>
                    {
                      const newExpanded = new Set(expandedSeasons);
                      if (isExpanded) { newExpanded.delete(season.seasonId); } else { newExpanded.add(season.seasonId); }
                      setExpandedSeasons(newExpanded);
                    };
                    return (
                      <section key={season.seasonId} className="overflow-hidden rounded-3xl border border-border/80 bg-background/25">
                        <button onClick={toggleSeason} className="w-full border-b border-border/70 bg-background/35 px-5 py-4 text-left">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div><div className="text-xs uppercase tracking-[0.2em] text-muted">Season {season.ordinalNumber}</div><h3 className="mt-2 text-xl font-semibold text-text">{season.name?.trim() || `Season ${season.ordinalNumber}`}</h3></div>
                            <Badge tone="accent">{season.episodes.length} episode{season.episodes.length === 1 ? '' : 's'}</Badge>
                          </div>
                        </button>
                        {isExpanded && season.episodes.length ? (
                          <div className="divide-y divide-border/70">
                            {season.episodes.map((episode, episodeIndex) => (
                              <EpisodeLink key={episode.episodeId} episodeId={episode.episodeId} className="block bg-background/15 px-5 py-4 hover:bg-white/5">
                                <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.5fr)_160px_180px] lg:items-center">
                                  <div className="text-sm font-semibold text-text">{episodeIndex + 1}. {episode.name?.trim() || `Episode ${episodeIndex + 1}`}</div>
                                  <div className="text-sm text-muted">{formatRuntime(episode.runtime)}</div>
                                  <div className="text-sm text-muted">{formatGenericRating(episode.avgVote)} average</div>
                                </div>
                              </EpisodeLink>
                            ))}
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        ) : null}
        <CommentSection contentId={contentId} isEpisodeRoute={false} hasValidContentId={hasValidContentId} titleType={TitleType.Series}/>
      </div>
    </main>
  );
}
