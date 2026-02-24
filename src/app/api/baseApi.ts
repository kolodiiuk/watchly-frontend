import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {storage} from "../../features/auth/StorageService.ts";

export const API_BASE_URL = 'http://localhost:5171';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    prepareHeaders: (headers, api) => {
      const token = storage.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Wishlist", "Cart", "Products", "Orders"],
  endpoints: () => ({}),
});
