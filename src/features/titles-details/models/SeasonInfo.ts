import type { EpisodeShortInfo } from "./EpisodeInfo"

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