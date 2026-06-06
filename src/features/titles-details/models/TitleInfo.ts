import type { SeasonInfo } from "./SeasonInfo";
import type { TitleType } from "./TitleType";

export interface TitleInfo {
  id: number;
  releaseDate?: string | null;
  runtime: number;
  titleType: TitleType;
  avgTmdbRating?: number | null;
  isAdult: boolean;
  name: string;
  overview?: string | null;
  posterUrl?: string | null;
  tagline: string;
  director: string;
  actors: string;
  localizationLanguages: string;
  avgVote: number;
  voteCount: number;
  productionCompanies: string[];
  genres: string[];
  seasons: SeasonInfo[];
  spokenLanguages: string[];
  genreIds: number[];
  productionCompanyIds: number[];
  spokenLanguageIds: number[];
}

export interface TitleShortInfo {
  id: number;
  name: string;
  posterUrl?: string | null;
  avgTmdbRating?: number | null;
  releaseDate?: string | null;
  titleType: TitleType;
}
