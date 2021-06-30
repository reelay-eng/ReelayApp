const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';

const MAX_TITLE_MATCH_DEVIATION = 100;
const POPULARITY_WEIGHT = 1;
const TITLE_MATCH_WEIGHT = 10;
const TMDB_SEARCH_RANK_WEIGHT = 10;

// https://dmitripavlutin.com/timeout-fetch-request/
const fetchResults = async (query, options={ timeout: 500 }) => {
    const { timeout = 8000 } = options;
  
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    const response = await fetch(query, {
        ...options,
        signal: controller.signal  
      }).then((response) => response.json())
        .catch((error) => {
            console.log(error);
        });
    clearTimeout(id);
    return response;
}

const compareSearchResults = (result1, result2) => {
    if (!result1.popularity) result1.popularity = 0;
    if (!result2.popularity) result2.popularity = 0;

    const result1Rank = (result1.popularity * POPULARITY_WEIGHT) 
                            - (result1.tmdb_search_rank * TMDB_SEARCH_RANK_WEIGHT);
    const result2Rank = (result2.popularity * POPULARITY_WEIGHT) 
                            - (result2.tmdb_search_rank * TMDB_SEARCH_RANK_WEIGHT);

    return (result2Rank - result1Rank);
}

const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;

    return Math.min(
        levenshteinDistance(s.substr(1), t) + 1,
        levenshteinDistance(t.substr(1), s) + 1,
        levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
    ) + 1;
}

export const searchMovies = async (searchText) => {
    const query = `${TMDB_API_BASE_URL}/search/movie\?api_key\=${TMDB_API_KEY}&query\=${searchText}`;
    return await fetchResults(query);
}

export const searchSeries = async (searchText) => {
    const query = `${TMDB_API_BASE_URL}/search/tv\?api_key\=${TMDB_API_KEY}&query\=${searchText}`;
    return await fetchResults(query);
}

export const searchMoviesAndSeries = async (searchText) => {
    const movieSearchResults = await searchMovies(searchText);
    const movieSearchResultsTagged = searchText.length > 0 ? movieSearchResults.results.map((result, index) => {

        // let titleMatchDeviation = MAX_TITLE_MATCH_DEVIATION;
        // if (result.title) {
        //     const resultComparator = result.title.length > searchText.length 
        //         ? result.title.slice(0, searchText.length) : result.title;
        //     titleMatchDeviation = levenshteinDistance(resultComparator, searchText);
        // }

        return {
            ...result,
            is_movie: true,
            is_series: false,
            // title_match_deviation: titleMatchDeviation,
            tmdb_search_rank: index,
        }
    }) : [];

    const seriesSearchResults = await searchSeries(searchText);
    const seriesSearchResultsTagged = searchText.length > 0 ? seriesSearchResults.results.map((result, index) => {

        // let titleMatchDeviation = MAX_TITLE_MATCH_DEVIATION;
        // if (result.title) {
        //     const resultComparator = result.title.length > searchText.length 
        //         ? result.title.slice(0, searchText.length) : result.title;
        //     titleMatchDeviation = levenshteinDistance(resultComparator, searchText);
        // }

        return {
            ...result,
            is_movie: false,
            is_series: true,
            // title_match_deviation: titleMatchDeviation,
            tmdb_search_rank: index,
            title: result.name,
            release_date: result.first_air_date,
        }
    }) : [];

    const searchResultsCombined = [...movieSearchResultsTagged, ...seriesSearchResultsTagged];
    const searchResultsCombinedSorted = searchResultsCombined.sort(compareSearchResults);
    return searchResultsCombinedSorted;
}

export const fetchSeries = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/tv\/${titleID}\?api_key\=${TMDB_API_KEY}`;
    return await fetchResults(query);
}

export const fetchMovie = async (titleID) => {
    const query = `${TMDB_API_BASE_URL}/movie\/${titleID}\?api_key\=${TMDB_API_KEY}`;
    return await fetchResults(query);
}