import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';

export const TMDbApi = createApi({
    reducerPath: 'TMDbApi',
    baseQuery: fetchBaseQuery({ baseUrl: TMDB_API_BASE_URL }),
    endpoints: (builder) => ({
        titleSearch: builder.query({
            query: (searchText) => ({
                url: `search/movie\?api_key\=${TMDB_API_KEY}&query\=${searchText}`,
                method: 'GET',
            }),
        }),
    }),
});

export const { useTitleSearchQuery } = TMDbApi;