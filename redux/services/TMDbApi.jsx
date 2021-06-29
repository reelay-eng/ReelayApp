import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';

export const TMDbApi = createApi({
    reducerPath: 'TMDbApi',
    baseQuery: fetchBaseQuery({ baseUrl: TMDB_API_BASE_URL }),
    endpoints: (builder) => ({
        movieSearch: builder.query({
            query: (searchText) => ({
                url: `search/movie\?api_key\=${TMDB_API_KEY}&query\=${searchText}`,
                method: 'GET',
            }),
        }),
        movieFetch: builder.query({
            query: (titleID) => ({
                url: `movie\/${titleID}\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
        movieCreditsFetch: builder.query({
            query: (titleID) => ({
                url: `movie\/${titleID}\/credits\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
        seriesSearch: builder.query({
            query: (searchText) => ({
                url: `search/tv\?api_key\=${TMDB_API_KEY}&query\=${searchText}`,
                method: 'GET',
            }),
        }),
        seriesFetch: builder.query({
            query: (titleID) => ({
                url: `tv\/${titleID}\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
        seriesFetchCredits: builder.query({
            query: (titleID) => ({
                url: `tv\/${titleID}\/credits\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
        seasonFetch: builder.query({
            query: (titleID, seasonID) => ({
                url: `tv\/${titleID}\/season\/${seasonID}\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
        seasonFetchCredits: builder.query({
            query: (titleID, seasonID) => ({
                url: `tv\/${titleID}\/season\/${seasonID}\/credits\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
        episodeFetch: builder.query({
            query: (titleID, seasonID, episodeID) => ({
                url: `tv\/${titleID}\/season\/${seasonID}\/episode\/${episodeID}\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
        episodeFetchCredits: builder.query({
            query: (titleID, seasonID, episodeID) => ({
                url: `tv\/${titleID}\/season\/${seasonID}\/episode\/${episodeID}\/credits\?api_key\=${TMDB_API_KEY}`,
                method: 'GET',
            }),
        }),
    }),
});

export const { 
    useMovieSearchQuery,
    useMovieFetchQuery, 
    useMovieCreditsFetchQuery,
    useSeriesSearchQuery,
    useSeriesFetchQuery,
    useSeriesFetchCreditsQuery,
    useSeasonFetchQuery,
    useSeasonFetchCreditsQuery,
    useEpisodeFetchQuery,
    useEpisodeFetchCreditsQuery,
} = TMDbApi;