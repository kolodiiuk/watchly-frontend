import type { TitleShortInfo } from '../../titles-details/models/TitleInfo';

export interface WatchListInfo {
  id: number;
  name: string;
  titles: TitleShortInfo[];
  isDefault?: boolean;
}

export interface WatchListShortInfo {
  id: number;
  name: string;
  isDefault?: boolean;
}
