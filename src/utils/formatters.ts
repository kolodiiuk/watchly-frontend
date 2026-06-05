import {TitleType} from "../features/titles-details/models/TitleType.ts";

export const formatReleaseDate = (value?: string | null) => {
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

export const formatRuntime = (runtime: number) => {
  if (!runtime || runtime <= 0) return 'Runtime not available';

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;

  return `${hours}h ${minutes}m`;
};

export const formatRating = (rating?: number | null) => {
  if (rating === null || rating === undefined) return 'TMDB rating unavailable';
  return `${rating.toFixed(1)} / 10`;
};

export const formatGenericRating = (rating?: number | null) => {
  if (rating === null || rating === undefined) return 'not available';
  return `${rating.toFixed(1)} / 10`;
};

export const formatVoteCount = (voteCount?: number | null) => {
  if (voteCount === null || voteCount === undefined) return 'No votes yet';
  if (voteCount === 1) return '1 vote';
  return `${voteCount} votes`;
};

export const formatTextOrUnavailable = (value?: string | null) => {
  if (!value || !value.trim()) return 'not available';
  return value.trim();
};

export const splitDisplayValues = (value?: string | null) => {
  if (!value || !value.trim()) return [];

  return value
    .split(', ')
    .map(item => item.trim())
    .filter(Boolean);
};

export const formatCommentDate = (value: string) => {
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

export const getCommentAuthorName = (
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

export const getFullImageUrl = (path: string, size: string) => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getContentType = (isEpisodeRoute: boolean, titleType: TitleType) : string =>
{
  if (isEpisodeRoute)
  {
    return "Episode"
  }

  return titleType == TitleType.Series ? "Series" : "Movie"
}

export const numberFormatter = new Intl.NumberFormat();
