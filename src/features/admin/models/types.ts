import type { TitleType } from '../../titles-details/models/TitleType.ts';

export type AdminTitleTypeFilter = 'all' | 'movie' | 'series';

export type AdminSortOption = 'name' | 'releaseDate' | 'rating';

export type AdminEditableTitleType = Exclude<AdminTitleTypeFilter, 'all'>;

export interface AdminTitleRow {
  id: number;
  name: string;
  type: 'movie' | 'series';
  releaseDate: string;
  rating: number;
}

export interface AdminEpisodeRow {
  id: number;
  ordinalNumber: number;
  name: string;
  runtime: number;
  releaseDate?: string | null;
  overview?: string | null;
}

export interface AdminSeasonRow {
  id: number;
  ordinalNumber: number;
  name: string;
  episodesCount: number;
  episodes: AdminEpisodeRow[];
}

export interface CreateTitleRequest {
  name: string;
  overview: string;
  contentType: TitleType;
  runtime: number;
  isAdult: boolean;
  releaseDate?: string | null;
  posterUrl?: string | null;
  tagline?: string | null;
  director?: string | null;
  actors?: string | null;
  localizationLanguages?: string | null;
  homePage?: string | null;
  avgTmdbRating?: number | null;
  genreIds: number[];
  spokenLanguageIds: number[];
  productionCompanyIds: number[];
}

export interface UpdateTitleRequest {
  name: string;
  overview: string;
  contentType: TitleType;
  runtime: number;
  isAdult: boolean;
  releaseDate?: string | null;
  tagline?: string | null;
  director?: string | null;
  actors?: string | null;
  localizationLanguages?: string | null;
  homePage?: string | null;
  avgTmdbRating?: number | null;
  genreIds: number[];
  spokenLanguageIds: number[];
  productionCompanyIds: number[];
}

export interface CreateSeasonRequest {
  ordinalNumber: number;
  name: string;
}

export interface UpdateSeasonRequest {
  ordinalNumber: number;
  name: string;
}

export interface CreateEpisodeRequest {
  ordinalNumber: number;
  runtime: number;
  tvShowId: number;
  name: string;
  posterUrl: string;
  releaseDate?: string | null;
}

export interface UpdateEpisodeRequest {
  ordinalNumber: number;
  runtime: number;
  name: string;
  posterUrl?: string | null;
  releaseDate?: string | null;
}

export interface AdminTitleFormValues {
  name: string;
  overview: string;
  titleType: AdminEditableTitleType;
  runtime: string;
  isAdult: boolean;
  releaseDate: string;
  posterUrl: string;
  posterFile: File | null;
  tagline: string;
  director: string;
  actors: string;
  localizationLanguages: string;
  homePage: string;
  avgTmdbRating: string;
  genreIds: number[];
  spokenLanguageIds: number[];
  productionCompanyIds: number[];
}

export interface TitleReferenceOption {
  id: number;
  name: string;
}

export interface TitleReferenceOptions {
  genres: TitleReferenceOption[];
  spokenLanguages: TitleReferenceOption[];
  productionCompanies: TitleReferenceOption[];
}

export interface AdminSeasonFormValues {
  ordinalNumber: string;
  name: string;
}

export interface AdminEpisodeFormValues {
  ordinalNumber: string;
  runtime: string;
  tvShowId: string;
  name: string;
  posterUrl: string;
  releaseDate: string;
}
