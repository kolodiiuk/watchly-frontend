import { useEffect, useMemo, useState, type ChangeEvent, type SubmitEvent } from 'react';
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
];

const watchStatusOptions = [
  { value: WatchStatus.PlanToWatch, label: 'Plan to watch' },
  { value: WatchStatus.Watching, label: 'Watching' },
  { value: WatchStatus.Completed, label: 'Completed' },
  { value: WatchStatus.Dropped, label: 'Dropped' },
];

export function MovieDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { titleId: titleIdParam } = useParams<{ titleId: string }>();
  const titleId = Number(titleIdParam);
  const hasValidTitleId = Number.isInteger(titleId) && titleId > 0;
  const [selectedWatchStatus, setSelectedWatchStatus] = useState<WatchStatus>(WatchStatus.PlanToWatch);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isEditingOwnComment, setIsEditingOwnComment] = useState(false);
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

  const ownComment = useMemo(() => {
    if (!user) return null;
    return comments.find(comment => comment.userId === user.id) ?? null;
  }, [comments, user]);

  useEffect(() => {
    if (!ownComment) {
      setCommentDraft('');
      return;
    }

    if (!isEditingOwnComment) {
      setCommentDraft(ownComment.text);
    }
  }, [ownComment, isEditingOwnComment]);

  const handleWatchStatusChange = (_titleId: number, _status: WatchStatus) => {
  };

  const onWatchStatusSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = Number(event.target.value) as WatchStatus;
    setSelectedWatchStatus(nextStatus);
    handleWatchStatusChange(titleId, nextStatus);
  };

  const handleCommentSubmit = async () => {
    setCommentError(null);

    if (ownComment && !isEditingOwnComment) {
      return;
    }

    const trimmedComment = commentDraft.trim();
    if (!trimmedComment) {
      setCommentError('Comment text is required.');
      return;
    }

    try {
      if (ownComment) {
        await updateComment({
          commentId: ownComment.id,
          text: trimmedComment,
        }).unwrap();
        dispatch(
          commentApi.util.updateQueryData('getCommentsByTitle', titleId, draft => {
            const commentToUpdate = draft.find(comment => comment.id === ownComment.id);
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
      }

    void refetchComments();
    } catch {
      setCommentError('We could not save your comment right now.');
    }
  };

  const handleEditOwnComment = () => {
    setCommentError(null);
    setCommentDraft(ownComment?.text ?? '');
    setIsEditingOwnComment(true);
  };

  const handleCancelEdit = () => {
    setCommentError(null);
    setCommentDraft(ownComment?.text ?? '');
    setIsEditingOwnComment(false);
  };

  const handleDeleteOwnComment = async () => {
    if (!ownComment) return;

    setCommentError(null);
    try {
      await deleteComment(ownComment.id).unwrap();
      dispatch(
        commentApi.util.updateQueryData('getCommentsByTitle', titleId, draft =>
          draft.filter(comment => comment.id !== ownComment.id)
        )
      );
      setCommentDraft('');
      setIsEditingOwnComment(false);
      void refetchComments();
    } catch {
      setCommentError('We could not delete your comment right now.');
    }
  };

  const isCommentMutationLoading = isLeavingComment || isUpdatingComment || isDeletingComment;

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
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="aspect-[2/3] rounded-3xl bg-background/60" />
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

          <div className="relative grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-background/45">
              {title.posterUrl ? (
                <img
                  src={getFullImageUrl(title.posterUrl, 'w500')}
                  alt={`${title.name} poster`}
                  className="aspect-[2/3] h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-background/60 p-6 text-center text-sm text-muted">
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

        <Card tone="glass">
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted">Comments</p>
                <h2 className="mt-2 text-2xl font-semibold text-text">What people are saying</h2>
              </div>
              <Badge tone="default">{comments.length} comment{comments.length === 1 ? '' : 's'}</Badge>
            </div>

            {isAuthenticated ? (
              <form
                className="rounded-3xl border border-border/80 bg-background/25 p-5"
                onSubmit={handleCommentSubmit}>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted">
                      {ownComment && !isEditingOwnComment
                        ? 'Your comment'
                        : ownComment
                          ? 'Edit your comment'
                          : 'Leave a comment'}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {ownComment && !isEditingOwnComment
                        ? 'You can revise or remove your comment here.'
                        : 'Share a quick reaction for other Watchly users.'}
                    </p>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm text-muted">Comment</span>
                    <textarea
                      value={commentDraft}
                      onChange={event => setCommentDraft(event.target.value)}
                      disabled={Boolean(ownComment) && !isEditingOwnComment}
                      rows={4}
                      placeholder="Write your thoughts about this movie."
                      className="w-full resize-none rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-text outline-none ring-0 transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </label>

                  {commentError ? <p className="text-sm text-danger">{commentError}</p> : null}

                  <div className="flex flex-wrap gap-3">
                    {ownComment ? (
                      isEditingOwnComment ? (
                        <>
                          <Button 
                            type="button" 
                            disabled={isCommentMutationLoading}
                            onClick={handleCommentSubmit}>
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
                      <Button type = "submit" onClick={handleCommentSubmit}  disabled={isCommentMutationLoading}>
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
              ) : comments.length ? (
                comments.map(comment => {
                  const isOwnComment = comment.userId === user?.id;
                  const authorName = getCommentAuthorName(comment, user?.id);

                  return (
                    <article
                      key={comment.id}
                      className="rounded-3xl border border-border/80 bg-background/25 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-text">{authorName}</h3>
                            {isOwnComment ? <Badge tone="accent">You</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm text-muted">{formatCommentDate(comment.updatedAt)}</p>
                        </div>
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
