import {useState} from 'react';
import {
  useChangeVoteEpisodeMutation,
  useChangeVoteTitleMutation,
  useGetEpisodeVoteQuery,
  useGetTitleVoteQuery,
  useVoteEpisodeMutation,
  useVoteTitleMutation,
} from '../api/voteApi.ts';

interface VoteControlProps {
  contentId: number;
  contentType: 'title' | 'episode';
  isAuthenticated: boolean;
}

export function VoteControl({contentId, contentType, isAuthenticated}: VoteControlProps)
{
  const titleVoteQuery = useGetTitleVoteQuery(contentId, {skip: !isAuthenticated || contentType !== 'title'});
  const episodeVoteQuery = useGetEpisodeVoteQuery(contentId, {skip: !isAuthenticated || contentType !== 'episode'});
  const currentVote = contentType === 'title' ? titleVoteQuery.data : episodeVoteQuery.data;
  const isLoadingVote = contentType === 'title' ? titleVoteQuery.isFetching : episodeVoteQuery.isFetching;
  const isVoteLoadError = contentType === 'title' ? titleVoteQuery.isError : episodeVoteQuery.isError;
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voteTitle, titleMutation] = useVoteTitleMutation();
  const [changeVoteTitle, changeTitleMutation] = useChangeVoteTitleMutation();
  const [voteEpisode, episodeMutation] = useVoteEpisodeMutation();
  const [changeVoteEpisode, changeEpisodeMutation] = useChangeVoteEpisodeMutation();
  const value = selectedValue ?? currentVote?.value ?? 0;
  const isSubmitting = titleMutation.isLoading || changeTitleMutation.isLoading || episodeMutation.isLoading || changeEpisodeMutation.isLoading;

  const submitVote = async () =>
  {
    if (!isAuthenticated || value === 0)
    {
      return;
    }

    setMessage(null);
    setError(null);
    try
    {
      if (contentType === 'title')
      {
        if (currentVote)
        {
          await changeVoteTitle({voteId: currentVote.id, titleId: contentId, value}).unwrap();
        }
        else
        {
          await voteTitle({titleId: contentId, value}).unwrap();
        }
      }
      else if (currentVote)
      {
        await changeVoteEpisode({voteId: currentVote.id, episodeId: contentId, value}).unwrap();
      }
      else
      {
        await voteEpisode({episodeId: contentId, value}).unwrap();
      }
      setSelectedValue(null);
      setMessage(currentVote ? `Rating updated to ${value}/10.` : `Rated ${value}/10.`);
    }
    catch
    {
      setError('Could not save rating. Please try again.');
    }
  };

  return (
    <section className="rounded-3xl border border-primary/25 bg-background/35 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]" aria-label="Community score">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Community score</p>
        <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 px-3 text-lg font-bold text-primary" aria-live="polite">
          {isLoadingVote ? '...' : value ? `${value}` : '--'}<span className="ml-0.5 text-xs text-muted">/10</span>
        </div>
      </div>

      {isAuthenticated ? (
        <>
          <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Choose rating from 1 to 10">
            {Array.from({length: 10}, (_, index) => index + 1).map(rating => {
              const isSelected = rating === value;
              return (
                <button
                  key={rating}
                  type="button"
                  aria-label={`Rate ${rating} out of 10`}
                  aria-pressed={isSelected}
                  disabled={isSubmitting || isLoadingVote || isVoteLoadError}
                  onClick={() => { setSelectedValue(rating); setMessage(null); setError(null); }}
                  className={`group flex aspect-square items-center justify-center rounded-xl border text-sm font-bold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:cursor-wait disabled:opacity-60 ${isSelected ? 'scale-105 border-primary bg-primary text-background shadow-[0_0_24px_rgba(245,197,66,0.28)]' : 'border-border/80 bg-surface/70 text-muted hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary'}`}
                >
                  {rating}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={submitVote} disabled={value === 0 || isSubmitting || isLoadingVote || isVoteLoadError || value === currentVote?.value} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-background transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-45">
              {isSubmitting ? 'Saving...' : currentVote ? 'Update rating' : 'Save rating'}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-2xl border border-border/70 bg-background/40 px-4 py-3 text-sm text-muted">Sign in to add your rating.</p>
      )}
      {isVoteLoadError ? <p role="alert" className="mt-3 text-sm text-danger">Could not load your saved rating. Voting is disabled to prevent a duplicate.</p> : null}
      {message ? <p role="status" className="mt-3 text-sm text-success">{message}</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-danger">{error}</p> : null}
    </section>
  );
}
