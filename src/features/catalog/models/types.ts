export interface SearchParams {
  term?: string;
  page?: number;
  pageSize?: number;
}

export interface IntRange {
  start: number;
  end: number;
}

export interface FloatRange {
  start: number;
  end: number;
}

export const SortBy = {
  ReleaseDateAsc: 0,
  TmdbRatingAsc: 1,
  ReleaseDateDesc: 2,
  TmdbRatingDesc: 3,
  Id: 4
} as const;

export type SortBy = (typeof SortBy)[keyof typeof SortBy];

export interface FilterRequest {
  genres?: number[];
  keywords?: number[];
  spokenLanguages?: number[];
  titleTypes?: number[];
  yearsRange?: IntRange;
  ratingRange?: FloatRange;
  page?: number;
  size?: number;
  sortBy?: SortBy;
  [key: string]: any;
}

export interface Keyword {
  id: number;
  name: string;
}
