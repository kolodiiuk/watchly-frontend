import type { SeasonShortInfo } from "./SeasonInfo"

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