import { baseApi } from './baseApi.ts';
import { TitleType } from '../models/TitleType.tsx';

export interface TitleShortInfo {
  id: number;
  name: string;
  posterUrl?: string | null;
  avgTmdbRating?: number | null;
}

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SpokenLanguage {
  id: number;
  name: string;
}

export interface TitleInfo {
  id: number;
  releaseDate: string;
  runtime: number;
  avgTmdbRating?: number | null;
  titleType: TitleType;
  name: string;
  overview?: string | null;
  posterUrl?: string | null;
  tagline: string;
  director: string;
  actors: string;
  localizationLanguages: string;
  avgVote: number;
  voteCount: number;
  productionCompanies: ProductionCompany[];
  genres: Genre[];
  seasons: SeasonInfo[];
  spokenLanguages: SpokenLanguage[];
}

export interface EpisodeInfo {
  episodeId: number,
  seasonId: number,
  ordinalNumber: number,
  runtime: number,
  name: string,
  posterUrl: string,
  season: SeasonShortInfo,
  avgVote: number,
  voteCount: number
}

export interface EpisodeShortInfo {
  episodeId: number,
  runtime: number,
  name: string,
  avgVote: number,
}

export interface SeasonInfo {
 seasonId: number,
 ordinalNumber: number,
 name: string,
 titleId: number,
 titleName: string,
 episodes: EpisodeShortInfo[]
}

export interface SeasonShortInfo {
  seasonId: number,
  ordinalNumber: number,
  name: string,
  titleId: number,
  titleName: string
}

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

function buildQueryString(params: Record<string, any>) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'object' && v.start !== undefined && v.end !== undefined) {
      qp.append(k, `${v.start}-${v.end}`);
      return;
    }

    if (Array.isArray(v)) {
      qp.append(k, v.map(item => String(item)).join(','));
      return;
    }

    qp.append(k, String(v));
  });

  const s = qp.toString();
  return s ? `?${s}` : '';
}

export const catalogApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    searchTitles: builder.query<TitleShortInfo[], SearchParams>({
      query: ({ term, page = 1, pageSize = 20 } = {}) => {
        const qs = buildQueryString({ term, page, pageSize });
        return { url: `catalog/search${qs}`, method: 'GET' };
      },
    }),
    filterTitles: builder.query<TitleShortInfo[], FilterRequest>({
      query: filter => {
        const qs = buildQueryString(filter || {});
        return { url: `catalog/filter${qs}`, method: 'GET' };
      },
    }),
    getTitle: builder.query<TitleInfo, number>({
      query: titleId => ({ url: `catalog/${titleId}`, method: 'GET' }),
    }),
    getEpisode: builder.query<EpisodeInfo, number>({
      query: episodeId => ({ url: `catalog/episode/${episodeId}`, method: 'GET' }),
    }),
  }),
  overrideExisting: false,
});

export const { useSearchTitlesQuery, useFilterTitlesQuery, useGetTitleQuery, useGetEpisodeQuery } = catalogApi;
