import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store";
import {useAuth} from "../../features/auth/services/AuthProvider";
import {useEffect, useMemo, useState} from "react";
import {
  commentApi,
  useDeleteCommentMutation,
  useGetCommentsByEpisodeQuery,
  useGetCommentsByTitleQuery,
  useLeaveCommentMutation,
  useUpdateCommentMutation
} from "../api/commentApi";
import {Card} from "../../components/ui/Card";
import {Badge} from "../../components/ui/Badge";
import {Button} from "../../components/ui/Button";
import {formatCommentDate, getCommentAuthorName, getContentType} from "../../utils/formatters";
import {TitleType} from "../models/TitleType.tsx";

function PenIcon()
{
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10-10a2.121 2.121 0 1 0-3-3L5 17v3Z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="m13.5 6.5 4 4"/>
    </svg>
  );
}

export interface CommentSectionProps {
  contentId: number,
  isEpisodeRoute: boolean,
  hasValidContentId: boolean,
  titleType: TitleType
}

export default function CommentSection(props: CommentSectionProps)
{
  const {contentId, hasValidContentId, isEpisodeRoute, titleType} = props;
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useAuth();
  const isAuthenticated = !!user;
  const [commentDraft, setCommentDraft] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isEditingOwnComment, setIsEditingOwnComment] = useState(false);
  const [selectedOwnCommentId, setSelectedOwnCommentId] = useState<number | null>(null);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [includeOwnCommentsInAssistantSearch, setIncludeOwnCommentsInAssistantSearch] = useState(true);
  const titleCommentsQuery = useGetCommentsByTitleQuery(contentId, {
    skip: !hasValidContentId || isEpisodeRoute,
  });
  const episodeCommentsQuery = useGetCommentsByEpisodeQuery(contentId, {
    skip: !hasValidContentId || !isEpisodeRoute,
  });

  const comments = isEpisodeRoute ? episodeCommentsQuery.data ?? [] : titleCommentsQuery.data ?? [];
  const isCommentsLoading = isEpisodeRoute ? episodeCommentsQuery.isLoading : titleCommentsQuery.isLoading;
  const isCommentsError = isEpisodeRoute ? episodeCommentsQuery.isError : titleCommentsQuery.isError;
  const refetchComments = isEpisodeRoute ? episodeCommentsQuery.refetch : titleCommentsQuery.refetch;
  const sortedComments = useMemo(() =>
  {
    const currentUserId = user?.id;

    return [...comments].sort((left, right) =>
    {
      const leftIsOwn = left.userId === currentUserId;
      const rightIsOwn = right.userId === currentUserId;

      if (leftIsOwn !== rightIsOwn)
      {
        return leftIsOwn ? -1 : 1;
      }

      const leftTime = new Date(left.updatedAt).getTime();
      const rightTime = new Date(right.updatedAt).getTime();

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime))
      {
        return right.id - left.id;
      }

      return rightTime - leftTime;
    });
  }, [comments, user?.id]);
  const ownComments = useMemo(() =>
  {
    if (!user)
    {
      return null;
    }
    return sortedComments.filter(comment => comment.userId === user.id);
  }, [sortedComments, user]);

  const selectedOwnComment = useMemo(() =>
  {
    if (!ownComments?.length)
    {
      return null;
    }
    if (selectedOwnCommentId === null)
    {
      return null;
    }

    return ownComments.find(comment => comment.id === selectedOwnCommentId) ?? ownComments[0];
  }, [ownComments, selectedOwnCommentId]);

  useEffect(() =>
  {
    if (!ownComments?.length)
    {
      setSelectedOwnCommentId(null);
      setCommentDraft('');
      setIsEditingOwnComment(false);
      return;
    }

    if (selectedOwnCommentId === null)
    {
      return;
    }

    const hasSelectedComment = ownComments.some(comment => comment.id === selectedOwnCommentId);
    if (!hasSelectedComment)
    {
      setSelectedOwnCommentId(ownComments[0].id);
    }
  }, [ownComments, selectedOwnCommentId]);

  useEffect(() =>
  {
    if (isEditingOwnComment)
    {
      return;
    }

    if (selectedOwnComment)
    {
      setCommentDraft(selectedOwnComment.text);
      return;
    }

    setCommentDraft('');
  }, [selectedOwnComment, isEditingOwnComment]);

  const [leaveComment, {isLoading: isLeavingComment}] = useLeaveCommentMutation();
  const [updateComment, {isLoading: isUpdatingComment}] = useUpdateCommentMutation();
  const [deleteComment, {isLoading: isDeletingComment}] = useDeleteCommentMutation();
  const handleAssistantCommentSearch = (_prompt: string, _includeOwnComments: boolean) =>
  {
  };

  const updateCommentsCacheAfterEdit = (commentId: number, text: string) =>
  {
    if (isEpisodeRoute)
    {
      dispatch(
        commentApi.util.updateQueryData('getCommentsByEpisode', contentId, draft =>
        {
          const commentToUpdate = draft.find(comment => comment.id === commentId);
          if (!commentToUpdate)
          {
            return;
          }

          commentToUpdate.text = text;
          commentToUpdate.updatedAt = new Date().toISOString();
        })
      );
      return;
    }

    dispatch(
      commentApi.util.updateQueryData('getCommentsByTitle', contentId, draft =>
      {
        const commentToUpdate = draft.find(comment => comment.id === commentId);
        if (!commentToUpdate)
        {
          return;
        }

        commentToUpdate.text = text;
        commentToUpdate.updatedAt = new Date().toISOString();
      })
    );
  };

  const updateCommentsCacheAfterDelete = (commentId: number) =>
  {
    if (isEpisodeRoute)
    {
      dispatch(
        commentApi.util.updateQueryData('getCommentsByEpisode', contentId, draft =>
          draft.filter(comment => comment.id !== commentId)
        )
      );
      return;
    }

    dispatch(
      commentApi.util.updateQueryData('getCommentsByTitle', contentId, draft =>
        draft.filter(comment => comment.id !== commentId)
      )
    );
  };

  const handleAssistantSearchSubmit = () =>
  {
    const trimmedPrompt = assistantPrompt.trim();
    if (!trimmedPrompt)
    {
      return;
    }

    handleAssistantCommentSearch(trimmedPrompt, includeOwnCommentsInAssistantSearch);
  };

  const handleCommentSubmit = async () =>
  {
    setCommentError(null);

    if (selectedOwnComment && !isEditingOwnComment)
    {
      return;
    }

    const trimmedComment = commentDraft.trim();
    if (!trimmedComment)
    {
      setCommentError('Comment text is required.');
      return;
    }

    try
    {
      if (selectedOwnComment)
      {
        await updateComment({
          commentId: selectedOwnComment.id,
          text: trimmedComment,
        }).unwrap();
        updateCommentsCacheAfterEdit(selectedOwnComment.id, trimmedComment);
        setCommentDraft(trimmedComment);
        setIsEditingOwnComment(false);
      } else
      {
        await leaveComment({
          contentId,
          text: trimmedComment,
          isTitle: !isEpisodeRoute,
        }).unwrap();
        setCommentDraft('');
      }

      void refetchComments();
    } catch
    {
      setCommentError('We could not save your comment right now.');
    }
  };

  const handleStartNewComment = () =>
  {
    setCommentError(null);
    setSelectedOwnCommentId(null);
    setCommentDraft('');
    setIsEditingOwnComment(false);
  };

  const handleSelectOwnComment = (direction: 'previous' | 'next') =>
  {
    if (!ownComments?.length || isEditingOwnComment)
    {
      return;
    }

    const currentIndex = selectedOwnComment
      ? ownComments.findIndex(comment => comment.id === selectedOwnComment.id)
      : 0;
    const offset = direction === 'previous' ? -1 : 1;
    const nextIndex = (currentIndex + offset + ownComments.length) % ownComments.length;

    setCommentError(null);
    setSelectedOwnCommentId(ownComments[nextIndex].id);
  };

  const handleSelectExistingComment = () =>
  {
    if (!ownComments?.length || isEditingOwnComment)
    {
      return;
    }

    setCommentError(null);
    setSelectedOwnCommentId(ownComments[0].id);
  };

  const handleEditOwnComment = () =>
  {
    if (!selectedOwnComment)
    {
      return;
    }

    setCommentError(null);
    setCommentDraft(selectedOwnComment.text);
    setIsEditingOwnComment(true);
  };

  const handleJumpToEditComment = (commentId: number) =>
  {
    const commentToEdit = ownComments?.find(comment => comment.id === commentId);
    if (!commentToEdit)
    {
      return;
    }

    setCommentError(null);
    setSelectedOwnCommentId(commentToEdit.id);
    setCommentDraft(commentToEdit.text);
  };

  const handleCancelEdit = () =>
  {
    setCommentError(null);
    setCommentDraft(selectedOwnComment?.text ?? '');
    setIsEditingOwnComment(false);
  };

  const handleDeleteOwnComment = async () =>
  {
    if (!selectedOwnComment)
    {
      return;
    }

    setCommentError(null);
    try
    {
      await deleteComment(selectedOwnComment.id).unwrap();
      updateCommentsCacheAfterDelete(selectedOwnComment.id);
      setCommentDraft('');
      setSelectedOwnCommentId(null);
      setIsEditingOwnComment(false);
      void refetchComments();
    } catch
    {
      setCommentError('We could not delete your comment right now.');
    }
  };
  const isCommentMutationLoading = isLeavingComment || isUpdatingComment || isDeletingComment;
  const selectedOwnCommentIndex = selectedOwnComment
    ? ownComments?.findIndex(comment => comment.id === selectedOwnComment.id) ?? -1
    : -1;
  const isCreatingNewComment = selectedOwnComment === null;

  return <Card tone="glass" className="relative overflow-hidden">
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,196,81,0.1),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(99,215,207,0.1),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_28%)]"/>
    <div className="relative space-y-6 gap-2">
      <div className="flex flex-col">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">Comments</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">What people are saying</h2>
        </div>
        <Badge tone="default">{comments.length} comment{comments.length === 1 ? '' : 's'}</Badge>
      </div>

      <section
        className="overflow-hidden rounded-3xl border border-primary/35 bg-[linear-gradient(135deg,rgba(245,196,81,0.12),rgba(99,215,207,0.08))] shadow-[0_0_0_1px_rgba(245,196,81,0.08)]">
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
                  : `Share a quick reaction for other Watchly users about this ${getContentType(isEpisodeRoute, titleType)}.`}
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-muted">Comment</span>
              <textarea
                value={commentDraft}
                onChange={event => setCommentDraft(event.target.value)}
                disabled={Boolean(selectedOwnComment) && !isEditingOwnComment}
                rows={4}
                placeholder={`Write your thoughts about this ${getContentType(isEpisodeRoute, titleType)}.`}
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
            <div className="h-28 animate-pulse rounded-3xl bg-background/35"/>
            <div className="h-28 animate-pulse rounded-3xl bg-background/35"/>
          </div>
        ) : isCommentsError ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/5 p-5 text-sm text-danger">
            We could not load comments for this {getContentType(isEpisodeRoute, titleType)} right now.
          </div>
        ) : sortedComments.length ? (
          sortedComments.map(comment =>
          {
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
                      <PenIcon/>
                    </button>
                  ) : null}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text">{comment.text}</p>
              </article>
            );
          })
        ) : (
          <div
            className="rounded-3xl border border-dashed border-border/80 bg-background/20 p-6 text-sm leading-6 text-muted">
            No comments yet. Be the first person to weigh in on this {getContentType(isEpisodeRoute, titleType)}.
          </div>
        )}
      </div>
    </div>
  </Card>
}
