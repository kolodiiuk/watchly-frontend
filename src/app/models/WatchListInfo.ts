import type { TitleShortInfo } from './TitleInfo';

export interface WatchListInfo {
  id: number;
  name: string;
  titles: TitleShortInfo[];
}

export interface WatchListShortInfo {
  id: number;
  name: string;
}
