import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../features/auth/services/AuthProvider.tsx';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useGetTitleQuery, type TitleInfo } from '../api/catalogApi';
import {
  commentApi,
  useDeleteCommentMutation,
  useGetCommentsByTitleQuery,
  useLeaveCommentMutation,
  useUpdateCommentMutation,
} from '../api/commentApi';
import { useVoteTitleMutation } from '../api/voteApi';
import { WatchStatus } from '../models/WatchStatus';
import type { AppDispatch } from '../store.ts';

const formatReleaseDate = (value?: string | null) => {
  if (!value) return 'Release date not available';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

const formatRuntime = (runtime: number) => {
  if (!runtime || runtime <= 0) return 'Runtime not available';

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;

  return `${hours}h ${minutes}m`;
};

const formatRating = (rating?: number | null) => {
  if (rating === null || rating === undefined) return 'TMDB rating unavailable';
  return `${rating.toFixed(1)} / 10`;
};

const formatCommentDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Updated recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate);
};

const getCommentAuthorName = (
  comment: {
    userId: string;
    user?: {
      displayName?: string | null;
      userName?: string | null;
      email: string;
    } | null;
  },
  currentUserId?: string
) => {
  if (comment.user?.displayName?.trim()) return comment.user.displayName.trim();
  if (comment.user?.userName?.trim()) return comment.user.userName.trim();
  if (comment.user?.email?.trim()) return comment.user.email.trim();
  if (comment.userId === currentUserId) return 'You';
  return 'Watchly user';
};

const getFullImageUrl = (path: string, size: string) => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

const detailItems = (titleInfo: TitleInfo) => [
  { label: 'Release date', value: formatReleaseDate(titleInfo.releaseDate) },
  { label: 'Runtime', value: formatRuntime(titleInfo.runtime) },
  { label: 'Average TMDB rating', value: formatRating(titleInfo.avgTmdbRating) },
  { label: 'Average Watchly rating', value: formatRating(10) },
];

const watchStatusOptions = [
  { value: WatchStatus.PlanToWatch, label: 'Plan to watch' },
  { value: WatchStatus.Watching, label: 'Watching' },
  { value: WatchStatus.Completed, label: 'Completed' },
  { value: WatchStatus.Dropped, label: 'Dropped' },
];

function PenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10a2.121 2.121 0 1 0-3-3L5 17v3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13.5 6.5 4 4" />
    </svg>
  );
}

export function MovieDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { titleId: titleIdParam } = useParams<{ titleId: string }>();
  const titleId = Number(titleIdParam);
  const hasValidTitleId = Number.isInteger(titleId) && titleId > 0;
  const [selectedWatchStatus, setSelectedWatchStatus] = useState<WatchStatus>(WatchStatus.PlanToWatch);
  const [selectedVoteValue, setSelectedVoteValue] = useState(8);
  const [hasSubmittedVote, setHasSubmittedVote] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isEditingOwnComment, setIsEditingOwnComment] = useState(false);
  const [selectedOwnCommentId, setSelectedOwnCommentId] = useState<number | null>(null);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [includeOwnCommentsInAssistantSearch, setIncludeOwnCommentsInAssistantSearch] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const { data: titleInfo, isLoading, isError } = useGetTitleQuery(titleId, {
    skip: !hasValidTitleId,
  });
  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useGetCommentsByTitleQuery(titleId, {
    skip: !hasValidTitleId,
  });

  const [leaveComment, { isLoading: isLeavingComment }] = useLeaveCommentMutation();
  const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();
  const [voteTitle, { isLoading: isSubmittingVote }] = useVoteTitleMutation();

  const sortedComments = useMemo(() => {
    const currentUserId = user?.id;

    return [...comments].sort((left, right) => {
      const leftIsOwn = left.userId === currentUserId;
      const rightIsOwn = right.userId === currentUserId;

      if (leftIsOwn !== rightIsOwn) {
        return leftIsOwn ? -1 : 1;
      }

      const leftTime = new Date(left.updatedAt).getTime();
      const rightTime = new Date(right.updatedAt).getTime();

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
        return right.id - left.id;
      }

      return rightTime - leftTime;
    });
  }, [comments, user?.id]);

  const ownComments = useMemo(() => {
    if (!user) return null;
    return sortedComments.filter(comment => comment.userId === user.id);
  }, [sortedComments, user]);

  const selectedOwnComment = useMemo(() => {
    if (!ownComments?.length) return null;
    if (selectedOwnCommentId === null) return null;

    return ownComments.find(comment => comment.id === selectedOwnCommentId) ?? ownComments[0];
  }, [ownComments, selectedOwnCommentId]);

  useEffect(() => {
    if (!ownComments?.length) {
      setSelectedOwnCommentId(null);
      setCommentDraft('');
      setIsEditingOwnComment(false);
      return;
    }

    if (selectedOwnCommentId === null) {
      return;
    }

    const hasSelectedComment = ownComments.some(comment => comment.id === selectedOwnCommentId);
    if (!hasSelectedComment) {
      setSelectedOwnCommentId(ownComments[0].id);
    }
  }, [ownComments, selectedOwnCommentId]);

  useEffect(() => {
    if (isEditingOwnComment) {
      return;
    }

    if (selectedOwnComment) {
      setCommentDraft(selectedOwnComment.text);
      return;
    }

    setCommentDraft('');
  }, [selectedOwnComment, isEditingOwnComment]);

  const handleWatchStatusChange = (_titleId: number, _status: WatchStatus) => {
  };

  const handleAssistantCommentSearch = (_prompt: string, _includeOwnComments: boolean) => {
  };

  const onWatchStatusSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = Number(event.target.value) as WatchStatus;
    setSelectedWatchStatus(nextStatus);
    handleWatchStatusChange(titleId, nextStatus);
  };

  const onVoteValueSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoteValue(Number(event.target.value));
    setVoteError(null);
    setVoteMessage(null);
  };

  const handleAssistantSearchSubmit = () => {
    const trimmedPrompt = assistantPrompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    handleAssistantCommentSearch(trimmedPrompt, includeOwnCommentsInAssistantSearch);
  };

  const handleVoteSubmit = async () => {
    setVoteError(null);
    setVoteMessage(null);

    if (!isAuthenticated) {
      setVoteError('Please sign in to rate this title.');
      return;
    }

    if (hasSubmittedVote) {
      setVoteError('Changing an existing vote needs vote lookup support from the current API.');
      return;
    }

    try {
      await voteTitle({
        titleId,
        value: selectedVoteValue,
      }).unwrap();
      setHasSubmittedVote(true);
      setVoteMessage(`Your rating of ${selectedVoteValue}/10 has been submitted.`);
    } catch {
      setVoteError('We could not submit your vote right now.');
    }
  };

  const handleCommentSubmit = async () => {
    setCommentError(null);

    if (selectedOwnComment && !isEditingOwnComment) {
      return;
    }

    const trimmedComment = commentDraft.trim();
    if (!trimmedComment) {
      setCommentError('Comment text is required.');
      return;
    }

    try {
      if (selectedOwnComment) {
        await updateComment({
          commentId: selectedOwnComment.id,
          text: trimmedComment,
        }).unwrap();
        dispatch(
          commentApi.util.updateQueryData('getCommentsByTitle', titleId, draft => {
            const commentToUpdate = draft.find(comment => comment.id === selectedOwnComment.id);
            if (!commentToUpdate) return;

            commentToUpdate.text = trimmedComment;
            commentToUpdate.updatedAt = new Date().toISOString();
          })
        );
        setCommentDraft(trimmedComment);
        setIsEditingOwnComment(false);
      } else {
        await leaveComment({
          contentId: titleId,
          text: trimmedComment,
          isTitle: true,
        }).unwrap();
        setCommentDraft('');
      }

      void refetchComments();
    } catch {
      setCommentError('We could not save your comment right now.');
    }
  };

  const handleStartNewComment = () => {
    setCommentError(null);
    setSelectedOwnCommentId(null);
    setCommentDraft('');
    setIsEditingOwnComment(false);
  };

  const handleSelectOwnComment = (direction: 'previous' | 'next') => {
    if (!ownComments?.length || isEditingOwnComment) return;

    const currentIndex = selectedOwnComment
      ? ownComments.findIndex(comment => comment.id === selectedOwnComment.id)
      : 0;
    const offset = direction === 'previous' ? -1 : 1;
    const nextIndex = (currentIndex + offset + ownComments.length) % ownComments.length;

    setCommentError(null);
    setSelectedOwnCommentId(ownComments[nextIndex].id);
  };

  const handleSelectExistingComment = () => {
    if (!ownComments?.length || isEditingOwnComment) return;

    setCommentError(null);
    setSelectedOwnCommentId(ownComments[0].id);
  };

  const handleEditOwnComment = () => {
    if (!selectedOwnComment) return;

    setCommentError(null);
    setCommentDraft(selectedOwnComment.text);
    setIsEditingOwnComment(true);
  };

  const handleJumpToEditComment = (commentId: number) => {
    const commentToEdit = ownComments?.find(comment => comment.id === commentId);
    if (!commentToEdit) return;

    setCommentError(null);
    setSelectedOwnCommentId(commentToEdit.id);
    setCommentDraft(commentToEdit.text);
  };

  const handleCancelEdit = () => {
    setCommentError(null);
    setCommentDraft(selectedOwnComment?.text ?? '');
    setIsEditingOwnComment(false);
  };

  const handleDeleteOwnComment = async () => {
    if (!selectedOwnComment) return;

    setCommentError(null);
    try {
      await deleteComment(selectedOwnComment.id).unwrap();
      dispatch(
        commentApi.util.updateQueryData('getCommentsByTitle', titleId, draft =>
          draft.filter(comment => comment.id !== selectedOwnComment.id)
        )
      );
      setCommentDraft('');
      setSelectedOwnCommentId(null);
      setIsEditingOwnComment(false);
      void refetchComments();
    } catch {
      setCommentError('We could not delete your comment right now.');
    }
  };

  const isCommentMutationLoading = isLeavingComment || isUpdatingComment || isDeletingComment;
  const selectedOwnCommentIndex = selectedOwnComment
    ? ownComments?.findIndex(comment => comment.id === selectedOwnComment.id) ?? -1
    : -1;
  const isCreatingNewComment = selectedOwnComment === null;

  const title = useMemo<TitleInfo | null>(() => {
    if (!titleInfo) return null;

    return {
      id: titleInfo.id,
      name: titleInfo.name,
      overview: titleInfo.overview,
      posterUrl: titleInfo.posterUrl,
      releaseDate: titleInfo.releaseDate,
      runtime: titleInfo.runtime,
      avgTmdbRating: titleInfo.avgTmdbRating,
    };
  }, [titleInfo]);

  if (!hasValidTitleId) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Movie details</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">We could not load this title.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              The route is missing a valid movie id, so there is nothing for us to request yet.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised" className="animate-pulse">
            <div className="grid gap-6 lg:grid-cols-[500px_minmax(0,1fr)]">
              <div className="rounded-3xl bg-background/60" />
              <div className="space-y-4">
                <div className="h-4 w-28 rounded-full bg-background/60" />
                <div className="h-10 w-3/4 rounded-2xl bg-background/60" />
                <div className="h-24 rounded-3xl bg-background/60" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="h-20 rounded-2xl bg-background/60" />
                  <div className="h-20 rounded-2xl bg-background/60" />
                  <div className="h-20 rounded-2xl bg-background/60" />
                  <div className="h-20 rounded-2xl bg-background/60" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (isError || !title) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Card tone="raised">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Movie details</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">This title is unavailable right now.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              We reached the catalog route, but no title details came back for this id.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card tone="glass" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,196,81,0.14),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(99,215,207,0.12),_transparent_34%)]" />

          <div className="relative grid gap-6 lg:grid-cols-[500px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-background/45">
              {title.posterUrl ? (
                <img
                  src={getFullImageUrl(title.posterUrl, 'w500')}
                  alt={`${title.name} poster`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center bg-background/60 p-6 text-center text-sm text-muted">
                  Poster unavailable
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="accent">Movie details</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">Catalog title</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                    {title.name}
                  </h1>
                </div>

                <p className="max-w-3xl text-sm leading-7 text-muted">
                  {title.overview?.trim() || 'Overview not available for this title yet.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {detailItems(title).map(item => (
                  <div key={item.label} className="rounded-2xl border border-border/80 bg-background/35 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-text">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border/80 bg-background/30 p-5">
                <div className="flex flex-col gap-4">
                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-accent">Status and actions</p>
                    <label className="block">
                      <span className="text-xs uppercase tracking-[0.2em] text-muted">Watch status</span>
                      <select
                        value={selectedWatchStatus}
                        onChange={onWatchStatusSelect}
                        className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30">
                        {watchStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                      <label className="block">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted">Your Watchly rating</span>
                        <select
                          value={selectedVoteValue}
                          onChange={onVoteValueSelect}
                          disabled={!isAuthenticated || isSubmittingVote}
                          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70">
                          {Array.from({ length: 10 }, (_, index) => index + 1).map(value => (
                            <option key={value} value={value}>
                              {value} / 10
                            </option>
                          ))}
                        </select>
                      </label>

                      <Button
                        type="button"
                        onClick={handleVoteSubmit}
                        disabled={isSubmittingVote || !isAuthenticated}
                        className="lg:min-w-[150px]">
                        {hasSubmittedVote ? 'Change vote' : 'Submit vote'}
                      </Button>
                    </div>
                    {voteError ? <p className="text-sm text-danger">{voteError}</p> : null}
                    {voteMessage ? <p className="text-sm text-success">{voteMessage}</p> : null}
                    {hasSubmittedVote ? (
                      <p className="text-sm leading-6 text-muted">
                        The current API accepts a new title vote, but it does not return or expose your existing
                        `voteId`, so safe vote changes need backend support first.
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-muted">
                        Rate this title on a 1 to 10 scale. Your rating is separate from the TMDB average above.
                      </p>
                    )}
                  </div>
                  <Button
                    style={{ maxWidth: '150px', width: '100%' }}
                    variant="secondary"
                    disabled
                    className="disabled:cursor-not-allowed disabled:opacity-70">
                    Add to watchlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card tone="glass" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,196,81,0.1),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(99,215,207,0.1),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_28%)]" />
          <div className="relative space-y-6 gap-2">
            <div className="flex flex-col">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted">Comments</p>
                <h2 className="mt-2 text-2xl font-semibold text-text">What people are saying</h2>
              </div>
              <Badge tone="default">{comments.length} comment{comments.length === 1 ? '' : 's'}</Badge>
            </div>

            <section className="overflow-hidden rounded-3xl border border-primary/35 bg-[linear-gradient(135deg,rgba(245,196,81,0.12),rgba(99,215,207,0.08))] shadow-[0_0_0_1px_rgba(245,196,81,0.08)]">
              <div className="rounded-t-[inherit] border-b border-primary/20 bg-background/30 px-5 py-4 backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-accent">AI comment search</p>
                    <h3 className="mt-2 text-xl font-semibold text-text">Find the most relevant reactions</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                      Ask the assistant to surface comments that match a topic, mood, spoiler concern, or specific
                      question.
                    </p>
                  </div>
                  <Badge tone="accent">Preview tool</Badge>
                </div>
              </div>

              <div className="rounded-b-[inherit] space-y-4 bg-background/20 p-5">
                <div className="rounded-2xl border border-primary/20 bg-background/35 px-4 py-3 text-sm leading-6 text-muted">
                  This panel is reserved for future assistant-powered comment discovery and works separately from
                  writing or editing your own comment.
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <label className="block">
                    <span className="text-sm font-medium text-text">Prompt</span>
                    <input
                      type="text"
                      value={assistantPrompt}
                      onChange={event => setAssistantPrompt(event.target.value)}
                      placeholder="Example: Find comments about pacing and the ending."
                      className="mt-2 w-full rounded-2xl border border-primary/20 bg-background/70 px-4 py-3 text-sm text-text outline-none ring-0 transition-colors focus:border-primary"
                    />
                  </label>

                  <Button
                    type="button"
                    onClick={handleAssistantSearchSubmit}
                    disabled={!assistantPrompt.trim()}
                    className="lg:min-w-[160px]">
                    Search comments
                  </Button>
                </div>

                <label className="inline-flex items-center gap-3 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={includeOwnCommentsInAssistantSearch}
                    onChange={event => setIncludeOwnCommentsInAssistantSearch(event.target.checked)}
                    className="h-4 w-4 rounded border border-primary/30 bg-background/60 text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <span>Include my comments in the assistant search</span>
                </label>
              </div>
            </section>

            {isAuthenticated ? (
              <form
                className="rounded-3xl border border-border/80 bg-background/25 p-5"
                onSubmit={event => event.preventDefault()}>
                <div className="flex flex-col gap-4">
                  {ownComments?.length ? (
                    <div className="rounded-2xl border border-border/70 bg-background/35 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted">Your comments</div>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            Your comments stay pinned to the top of the discussion. Pick one to revise, or start a new
                            note.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant={isCreatingNewComment ? 'primary' : 'secondary'}
                            onClick={handleStartNewComment}
                            disabled={isCommentMutationLoading || isEditingOwnComment}>
                            New comment
                          </Button>
                          {isCreatingNewComment ? (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={handleSelectExistingComment}
                              disabled={isCommentMutationLoading || isEditingOwnComment}>
                              Edit existing
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleSelectOwnComment('previous')}
                                disabled={isCommentMutationLoading || isEditingOwnComment || ownComments.length < 2}>
                                Previous
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleSelectOwnComment('next')}
                                disabled={isCommentMutationLoading || isEditingOwnComment || ownComments.length < 2}>
                                Next
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Badge tone="accent">{ownComments.length} of your comments</Badge>
                        {!isCreatingNewComment && selectedOwnCommentIndex >= 0 ? (
                          <Badge tone="default">
                            {selectedOwnCommentIndex + 1} / {ownComments.length}
                          </Badge>
                        ) : (
                          <Badge tone="default">New draft</Badge>
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted">
                      {selectedOwnComment && !isEditingOwnComment
                        ? 'Selected comment'
                        : selectedOwnComment
                          ? 'Edit selected comment'
                          : 'Leave a comment'}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {selectedOwnComment && !isEditingOwnComment
                        ? 'Cycle through your comments, then revise or remove the one you want.'
                        : 'Share a quick reaction for other Watchly users.'}
                    </p>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm text-muted">Comment</span>
                    <textarea
                      value={commentDraft}
                      onChange={event => setCommentDraft(event.target.value)}
                      disabled={Boolean(selectedOwnComment) && !isEditingOwnComment}
                      rows={4}
                      placeholder="Write your thoughts about this movie."
                      className="w-full resize-none rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-text outline-none ring-0 transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </label>

                  {commentError ? <p className="text-sm text-danger">{commentError}</p> : null}

                  <div className="flex flex-wrap gap-3">
                    {selectedOwnComment ? (
                      isEditingOwnComment ? (
                        <>
                          <Button type="button" onClick={handleCommentSubmit} disabled={isCommentMutationLoading}>
                            Save changes
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            disabled={isCommentMutationLoading}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button type="button" onClick={handleEditOwnComment} disabled={isCommentMutationLoading}>
                            Change comment
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleDeleteOwnComment}
                            disabled={isCommentMutationLoading}>
                            Delete comment
                          </Button>
                        </>
                      )
                    ) : (
                      <Button type="button" onClick={handleCommentSubmit} disabled={isCommentMutationLoading}>
                        Leave comment
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <div className="rounded-3xl border border-border/80 bg-background/25 p-5 text-sm leading-6 text-muted">
                Sign in to leave a comment and join the discussion.
              </div>
            )}

            <div className="space-y-4">
              {isCommentsLoading ? (
                <div className="space-y-3">
                  <div className="h-28 animate-pulse rounded-3xl bg-background/35" />
                  <div className="h-28 animate-pulse rounded-3xl bg-background/35" />
                </div>
              ) : isCommentsError ? (
                <div className="rounded-3xl border border-danger/30 bg-danger/5 p-5 text-sm text-danger">
                  We could not load comments for this title right now.
                </div>
              ) : sortedComments.length ? (
                sortedComments.map(comment => {
                  const isOwnComment = comment.userId === user?.id;
                  const authorName = getCommentAuthorName(comment, user?.id);
                  const isSelectedOwnComment = selectedOwnCommentId === comment.id;

                  return (
                    <article
                      key={comment.id}
                      className={[
                        'rounded-3xl border bg-background/25 p-5 transition-colors',
                        isSelectedOwnComment
                          ? 'border-primary/80 bg-primary/5 shadow-[0_0_0_1px_rgba(245,196,81,0.18)]'
                          : 'border-border/80',
                      ]
                        .filter(Boolean)
                        .join(' ')}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-text">{authorName}</h3>
                            {isOwnComment ? <Badge tone="accent">You</Badge> : null}
                            {isSelectedOwnComment ? <Badge tone="warning">Selected</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm text-muted">{formatCommentDate(comment.updatedAt)}</p>
                        </div>
                        {isOwnComment ? (
                          <button
                            type="button"
                            aria-label="Edit this comment"
                            title="Edit this comment"
                            onClick={() => handleJumpToEditComment(comment.id)}
                            disabled={isCommentMutationLoading}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/55 text-muted transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-text disabled:cursor-not-allowed disabled:opacity-60">
                            <PenIcon />
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text">{comment.text}</p>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 bg-background/20 p-6 text-sm leading-6 text-muted">
                  No comments yet. Be the first person to weigh in on this movie.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
