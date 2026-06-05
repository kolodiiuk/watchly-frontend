import { baseApi } from '../../../app/api/baseApi.ts';
import type { EpisodeInfo } from '../../titles-details/models/EpisodeInfo.ts';
import type { TitleInfo, TitleShortInfo } from '../../titles-details/models/TitleInfo.ts';
import type { SpokenLanguage } from '../../titles-details/models/SpokenLanguage.ts';
import type {FilterRequest, Keyword, SearchParams} from "../models/types.ts";

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
    getKeywordSuggestions: builder.query<Keyword[], string>({
      query: term => {
        const qs = buildQueryString({ term });
        return { url: `catalog/keyword-suggestions${qs}`, method: 'GET' };
      },
    }),
    getSpokenLanguages: builder.query<SpokenLanguage[], void>({
      query: () => ({ url: 'catalog/spoken-languages', method: 'GET' }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchTitlesQuery,
  useFilterTitlesQuery,
  useGetTitleQuery,
  useGetEpisodeQuery,
  useGetKeywordSuggestionsQuery,
  useGetSpokenLanguagesQuery
} = catalogApi;
