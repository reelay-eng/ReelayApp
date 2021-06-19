import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';

const TMDB_IMAGE_API_BASE_URL = 'http://image.tmdb.org/t/p/';
const TMDB_POSTER_SIZE = 'w500';


export const TMDbApi = createApi({
    reducerPath: 'TMDbApi',
    baseQuery: fetchBaseQuery({ baseUrl: TMDB_API_BASE_URL }),
    endpoints: (builder) => ({
        // note: these queries ONLY work for movies
        titleSearch: builder.query({
            query: (searchText) => ({
                url: `search/movie\?api_key\=${TMDB_API_KEY}&query\=${searchText}`,
                method: 'GET',
            }),
        }),
        creditsFetch: builder.query({
            query: (titleID) => ({
                url: `movie\/${titleID}\/credits`,
                method: 'GET',
            }),
        }),
    }),
});

export const { useTitleSearchQuery, useCreditsFetchQuery } = TMDbApi;