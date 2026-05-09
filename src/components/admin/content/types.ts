export type AdminTitleTypeFilter = 'all' | 'movie' | 'series';

export type AdminSortOption = 'name' | 'releaseDate' | 'rating';

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
  releaseDate: string;
  overview: string;
}

export interface AdminSeasonRow {
  id: number;
  ordinalNumber: number;
  name: string;
  episodesCount: number;
  episodes: AdminEpisodeRow[];
}
